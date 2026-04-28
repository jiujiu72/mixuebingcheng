<template>
  <div class="auth-container">
    <div class="auth-background">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>
    
    <div class="auth-card">
      <div class="auth-header">
        <div class="logo-container">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h1 class="title">美味点餐系统</h1>
          <p class="subtitle">欢迎回来，请登录您的账户</p>
        </div>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        class="auth-form"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            size="large"
            class="auth-input"
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
            class="auth-input"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <div class="form-actions">
            <el-checkbox v-model="rememberMe">记住我</el-checkbox>
            <div class="login-links">
              <router-link to="/register" class="forgot-link">没有账号？去注册</router-link>
              <span class="link-divider">|</span>
              <router-link to="/delivery-login" class="forgot-link">外卖小哥登录</router-link>
            </div>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="auth-button"
            @click="handleLogin"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="auth-footer">
        <p>© 2024 美味点餐系统 - 让用餐更美好</p>
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
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

const handleLogin = () => {
  if (!form.username || !form.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }
  
  loading.value = true
  
  setTimeout(() => {
    loading.value = false
    
    if (form.username === 'user' && form.password === '123456') {
      localStorage.setItem('user', JSON.stringify({ username: form.username }))
      ElMessage.success('登录成功！')
      router.push('/home')
    } else {
      ElMessage.error('用户名或密码错误！演示账号: user / 123456')
    }
  }, 500)
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
  padding: 20px;
}

.auth-background {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: -50px;
  left: -50px;
  animation-delay: 0s;
}

.circle-2 {
  width: 200px;
  height: 200px;
  bottom: 100px;
  right: 50px;
  animation-delay: 2s;
}

.circle-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  left: 50%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(-20px) scale(1.05);
  }
}

.auth-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 40px;
  width: 100%;
  max-width: 420px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.5);
  animation: slideUp 0.6s ease-out;
  position: relative;
  z-index: 10;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
}

.logo-icon svg {
  width: 32px;
  height: 32px;
  color: white;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.auth-form {
  margin-bottom: 20px;
}

.auth-input {
  --el-input-bg-color: #f8fafc;
  --el-input-border-color: #e2e8f0;
  --el-input-hover-border-color: #667eea;
  --el-input-focus-border-color: #667eea;
}

.auth-input :deep(.el-input__wrapper) {
  border-radius: 12px;
  padding: 4px 16px;
  box-shadow: none;
  transition: all 0.3s ease;
}

.auth-input :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.auth-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.login-links {
  display: flex;
  align-items: center;
  gap: 8px;
}

.link-divider {
  color: #cbd5e1;
  font-size: 14px;
}

.forgot-link {
  font-size: 14px;
  color: #667eea;
  text-decoration: none;
  transition: color 0.3s ease;
}

.forgot-link:hover {
  color: #764ba2;
  text-decoration: underline;
}

.auth-button {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.auth-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.5);
}

.auth-button:active {
  transform: translateY(0);
}

.auth-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.auth-footer p {
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
}

@media (max-width: 480px) {
  .auth-card {
    padding: 24px;
    border-radius: 16px;
  }
  
  .title {
    font-size: 24px;
  }
  
  .logo-icon {
    width: 56px;
    height: 56px;
  }
}
</style>
