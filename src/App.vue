<template>
  <div class="layout">
    <header class="topbar">
      <h1>Vue 12 天重学项目</h1>
      <nav class="nav">
        <RouterLink to="/">首页</RouterLink>
        <RouterLink to="/tasks">任务</RouterLink>
        <RouterLink to="/practise">练习</RouterLink>

        <template v-if="userStore.isLoggedIn">
          <RouterLink to="/profile">我的</RouterLink>
          <span class="greeting">Hi, {{ userStore.profile?.username }}</span>
          <a href="#" @click.prevent="handleLogout" class="logout-link">退出</a>
        </template>
        <template v-else>
          <RouterLink to="/login">登录</RouterLink>
        </template>
      </nav>
    </header>

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from './stores/user'

const router = useRouter()
const userStore = useUserStore()

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}

// 监听浏览器本地存储变化的函数
const handleStorageChange = (e) => {
  // 当缓存里的 'user' 数据被修改或删除时触发
  if (e.key === 'user' && !e.newValue) {
    // 强制同步 Pinia 状态为退出登录
    userStore.logout()

    // 如果当前在需要权限的页面，立刻踢回首页
    if (router.currentRoute.value.meta.requiresAuth) {
      alert('检测到登录状态异常，已自动退出')
      router.replace({ name: 'home' })
    }
  }
}

onMounted(() => {
  // 开启监听
  window.addEventListener('storage', handleStorageChange)
})

onUnmounted(() => {
  // 离开时销毁监听，防止内存泄漏
  window.removeEventListener('storage', handleStorageChange)
})
</script>

<style scoped>
.layout {
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #d7dee7;
  background: #ffffff;
}

.topbar h1 {
  font-size: 20px;
  font-weight: 700;
}

.nav {
  display: flex;
  gap: 12px;
}

.nav a {
  color: #365070;
  text-decoration: none;
  padding: 6px 10px;
  border-radius: 8px;
}

.nav a.router-link-active {
  background: #e6f0ff;
  color: #1b3e73;
}

.content {
  padding: 20px;
}
.greeting {
  color: #6b7280;
  font-size: 14px;
  margin-left: 8px;
}
.logout-link {
  color: #ef4444 !important;
  cursor: pointer;
}
</style>
