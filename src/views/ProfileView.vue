<template>
  <section class="panel">
    <h2>我的信息</h2>

    <div v-if="userStore.isLoggedIn" class="meta">
      <p>用户名：{{ userStore.profile?.username }}</p>
      <p>角色：{{ userStore.profile?.role }}</p>
      <p>Token：{{ userStore.token }}</p>
      <button @click="userStore.logout">退出登录</button>
    </div>
  </section>
</template>

<script setup>
import { useUserStore } from '../stores/user'

const userStore = useUserStore()
</script>

<style scoped>
.panel {
  background: #fff;
  border: 1px solid #d7dee7;
  border-radius: 10px;
  padding: 14px;
}

.form,
.meta {
  margin-top: 12px;
  display: grid;
  gap: 10px;
}

input {
  width: 220px;
  padding: 6px 8px;
}

button {
  width: fit-content;
  padding: 6px 12px;
  border: 1px solid #8ca5c8;
  border-radius: 8px;
  background: #edf4ff;
  cursor: pointer;
}
</style>
