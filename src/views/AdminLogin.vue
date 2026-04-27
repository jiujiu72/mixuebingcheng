<template>
  <div class="admin-login-container">
    <div class="admin-login-background">
      <div class="admin-circle admin-circle-1"></div>
      <div class="admin-circle admin-circle-2"></div>
      <div class="admin-circle admin-circle-3"></div>
    </div>
    
    <div class="admin-login-card">
      <div class="admin-login-header">
        <div class="admin-logo-container">
          <div class="admin-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h1 class="admin-title">后台管理系统</h1>
          <p class="admin-subtitle">管理员登录入口</p>
        </div>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        class="admin-login-form"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入管理员账号"
            size="large"
            class="admin-login-input"
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
            placeholder="请输入管理员密码"
            size="large"
            show-password
            class="admin-login-input"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <div class="admin-form-actions">
            <el-checkbox v-model="rememberMe">记住我</el-checkbox>
            <router-link to="/login" class="admin-forgot-link">用户登录</router-link>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="admin-login-button"
            @click="handleLogin"
          >
            管理员登录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="admin-login-footer">
        <p>© 2024 美味点餐系统 - 管理员后台</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'

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
    { required: true, message: '请输入管理员账号', trigger: 'blur' },
    { min: 2, max: 20, message: '账号长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入管理员密码', trigger: 'blur' },
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
      
      if (form.username === 'admin' && form.password === '123456') {
        localStorage.setItem('admin', JSON.stringify({ username: form.username }))
        ElMessage.success('登录成功！')
        router.push('/admin')
      } else {
        ElMessage.error('管理员账号或密码错误！演示账号: admin / 123456')
      }
    }, 1000)
  } catch {
    // 表单验证失败
  }
}
</script>

<style scoped>
.admin-login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4338ca 0%, #6366f1 100%);
  position: relative;
  overflow: hidden;
  padding: 20px;
}

.admin-login-background {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.admin-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: adminFloat 6s ease-in-out infinite;
}

.admin-circle-1 {
  width: 300px;
  height: 300px;
  top: -50px;
  left: -50px;
  animation-delay: 0s;
}

.admin-circle-2 {
  width: 200px;
  height: 200px;
  bottom: 100px;
  right: 50px;
  animation-delay: 2s;
}

.admin-circle-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  left: 50%;
  animation-delay: 4s;
}

@keyframes adminFloat {
  0%, 100% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(-20px) scale(1.05);
  }
}

.admin-login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 40px;
  width: 100%;
  max-width: 420px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.5);
  animation: adminSlideUp 0.6s ease-out;
  position: relative;
  z-index: 10;
}

@keyframes adminSlideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.admin-login-header {
  text-align: center;
  margin-bottom: 32px;
}

.admin-logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.admin-logo-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #4338ca 0%, #6366f1 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  box-shadow: 0 8px 24px rgba(67, 56, 202, 0.4);
}

.admin-logo-icon svg {
  width: 32px;
  height: 32px;
  color: white;
}

.admin-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.admin-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.admin-login-form {
  margin-bottom: 20px;
}

.admin-login-input {
  --el-input-bg-color: #f8fafc;
  --el-input-border-color: #e2e8f0;
  --el-input-hover-border-color: #6366f1;
  --el-input-focus-border-color: #6366f1;
}

.admin-login-input :deep(.el-input__wrapper) {
  border-radius: 12px;
  padding: 4px 16px;
  box-shadow: none;
  transition: all 0.3s ease;
}

.admin-login-input :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.admin-login-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}

.admin-form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.admin-forgot-link {
  font-size: 14px;
  color: #6366f1;
  text-decoration: none;
  transition: color 0.3s ease;
}

.admin-forgot-link:hover {
  color: #4338ca;
  text-decoration: underline;
}

.admin-login-button {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #4338ca 0%, #6366f1 100%);
  border: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.admin-login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.5);
}

.admin-login-button:active {
  transform: translateY(0);
}

.admin-login-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.admin-login-footer p {
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
}

@media (max-width: 480px) {
  .admin-login-card {
    padding: 24px;
    border-radius: 16px;
  }
  
  .admin-title {
    font-size: 24px;
  }
  
  .admin-logo-icon {
    width: 56px;
    height: 56px;
  }
}
</style>