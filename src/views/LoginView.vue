<template>
  <section class="panel login-panel">
    <h2>用户登录</h2>

    <transition name="fade">
      <div v-if="serverError" class="server-error-box">
        ⚠️ {{ serverError }}
      </div>
    </transition>

    <form class="form" @submit.prevent="handleLogin">
      <div class="form-item">
        <label for="username">用户名：</label>
        <div class="input-wrapper">
          <input
            id="username"
            type="text"
            v-model.trim="formData.username"
            placeholder="请输入用户名 (至少3个字符)"
            :class="{ 'has-error': formErrors.username }"
            @blur="validateField('username')"
            @input="clearFieldError('username')"
            :disabled="isSubmitting"
          />
          <span v-if="formErrors.username" class="error-text">{{
            formErrors.username
          }}</span>
        </div>
      </div>

      <div class="form-item">
        <label for="password">密　码：</label>
        <div class="input-wrapper">
          <input
            id="password"
            type="password"
            v-model.trim="formData.password"
            placeholder="请输入密码 (至少6个字符)"
            :class="{ 'has-error': formErrors.password }"
            @blur="validateField('password')"
            @input="clearFieldError('password')"
            :disabled="isSubmitting"
          />
          <span v-if="formErrors.password" class="error-text">{{
            formErrors.password
          }}</span>
        </div>
      </div>

      <button
        type="submit"
        class="submit-btn"
        :disabled="isSubmitting"
        :class="{ 'is-loading': isSubmitting }"
      >
        {{ isSubmitting ? '登录中...' : '立即登录' }}
      </button>
    </form>
  </section>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { login } from '@/api/modules/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const formData = reactive({
  username: 'johnd', // 保留测试账号方便调试
  password: 'm38rmF$',
})

const formErrors = reactive({
  username: '',
  password: '',
})

const isSubmitting = ref(false)
const serverError = ref('')

onMounted(() => {
  if (route.query.redirect) {
    serverError.value = '您需要先登录才能访问该页面'
  }
})

const validateField = (field) => {
  if (field === 'username') {
    if (!formData.username) {
      formErrors.username = '用户名不能为空'
    } else if (formData.username.length < 3) {
      formErrors.username = '用户名不能少于3个字符'
    } else {
      formErrors.username = ''
    }
  }

  if (field === 'password') {
    if (!formData.password) {
      formErrors.password = '密码不能为空'
    } else if (formData.password.length < 6) {
      formErrors.password = '密码不能少于6个字符'
    } else {
      formErrors.password = ''
    }
  }
}

const clearFieldError = (field) => {
  formErrors[field] = ''
  serverError.value = ''
}

const validateForm = () => {
  validateField('username')
  validateField('password')

  return !formErrors.username && !formErrors.password
}

const handleLogin = async () => {
  if (isSubmitting.value) return
  if (!validateForm()) return
  isSubmitting.value = true
  serverError.value = ''

  try {
    const res = await login({
      username: formData.username,
      password: formData.password,
    })
    userStore.login({
      token: res.token,
      username: formData.username,
    })
    const redirectPath = route.query.redirect || '/'
    router.push(redirectPath)
  } catch (err) {
    if (err.response?.status === 401) {
      serverError.value = '用户名或密码错误'
    } else {
      serverError.value = '服务器错误，请稍后再试'
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
/* 容器样式 */
.login-panel {
  max-width: 400px;
  margin: 40px auto;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  color: #1f2937;
  margin-bottom: 24px;
}

/* 顶部错误提示框 */
.server-error-box {
  background-color: #fef2f2;
  color: #ef4444;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #fee2e2;
  margin-bottom: 20px;
  font-size: 14px;
  text-align: center;
}

/* 表单项布局 */
.form-item {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-item label {
  font-size: 14px;
  font-weight: 500;
  color: #4b5563;
}

.input-wrapper {
  display: flex;
  flex-direction: column;
}

/* 输入框样式 */
input {
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.3s ease;
  outline: none;
}

input:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

input.has-error {
  border-color: #ef4444;
  background-color: #fefafaa6;
}

input:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
  color: #9ca3af;
}

/* 字段下方的错误文字 */
.error-text {
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
  margin-left: 2px;
}

/* 提交按钮样式 */
.submit-btn {
  width: 100%;
  padding: 14px;
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.submit-btn:hover:not(:disabled) {
  background-color: #4338ca;
}

.submit-btn:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

/* 简单的淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
