<template>
  <section class="panel">
    <h2>404</h2>
    <p>页面不存在，请返回首页继续学习。</p>
    <RouterLink to="/">返回首页</RouterLink>
  </section>
</template>

<style scoped>
.panel {
  background: #fff;
  border: 1px solid #d7dee7;
  border-radius: 10px;
  padding: 14px;
  display: grid;
  gap: 8px;
}

a {
  color: #1b3e73;
}
</style>
