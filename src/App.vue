<template>
  <router-view />
</template>

<script setup>
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

:root {
  --primary-color: #667eea;
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #ef4444;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;
  --border-light: #e2e8f0;
  --bg-light: #f8fafc;
  --bg-card: #ffffff;
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.1);
  --shadow-primary: 0 4px 12px rgba(102, 126, 234, 0.4);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-2xl: 24px;
  --transition-fast: 0.15s ease;
  --transition-normal: 0.3s ease;
  --transition-slow: 0.5s ease;
}

body {
  background: #f8fafc;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.el-button {
  border-radius: var(--radius-md);
  font-weight: 600;
}

.el-button--primary {
  --el-button-bg-color: var(--primary-color);
  --el-button-border-color: var(--primary-color);
}

.el-button--primary:hover {
  --el-button-hover-bg-color: #5a6fd6;
  --el-button-hover-border-color: #5a6fd6;
}

.el-input__wrapper {
  border-radius: var(--radius-md);
}

.el-card {
  border-radius: var(--radius-xl);
  border: none;
  box-shadow: var(--shadow-sm);
}

.el-dialog {
  border-radius: var(--radius-xl);
}

.el-drawer {
  border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
}

.el-drawer.mobile-cart-drawer {
  height: 80vh !important;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.el-drawer.mobile-cart-drawer .el-drawer__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 0 !important;
  overflow: hidden;
}

.el-drawer.mobile-cart-drawer .el-drawer__header {
  flex-shrink: 0;
  margin: 0;
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
}

.el-message {
  border-radius: var(--radius-lg);
  border: none;
  box-shadow: var(--shadow-md);
}

.el-message-box {
  border-radius: var(--radius-xl);
  border: none;
}

.el-checkbox__input.is-checked .el-checkbox__inner,
.el-checkbox__input.is-indeterminate .el-checkbox__inner {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.el-checkbox__input.is-checked + .el-checkbox__label {
  color: var(--primary-color);
}

.el-form-item__label {
  font-weight: 500;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.scale-enter-active,
.scale-leave-active {
  transition: all 0.2s ease;
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
