<template>
  <section class="panel">
    <h2>🚀 Vue3 电商实战项目</h2>
    <p>
      这是一个涵盖了 Vue3 核心生态（Router, Pinia, Composition
      API）的完整业务闭环项目。
    </p>

    <div class="cards">
      <article>
        <h3>今日学习时长</h3>
        <p class="highlight">{{ learningStore.todayHours }} 小时</p>
      </article>
      <article>
        <h3>当前任务进度</h3>
        <p class="highlight">{{ learningStore.progressText }}</p>
      </article>
    </div>

    <div class="features-section">
      <h3>✨ 项目核心亮点</h3>
      <ul>
        <li>
          <strong>工程化体系：</strong> Vite 构建、Axios 拦截器、Token
          无感鉴权。
        </li>
        <li>
          <strong>状态管理：</strong> 基于 Pinia 的购物车全局状态流转与
          LocalStorage 持久化。
        </li>
        <li>
          <strong>复杂交互：</strong> 包含 搜索、筛选、多字段排序 以及
          完整的状态机驱动的结算流程。
        </li>
        <li>
          <strong>响应式设计：</strong> 适配多端设备的 CSS
          现代布局（Flex/Grid）。
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup>
import { useLearningStore } from '../stores/learning'

const learningStore = useLearningStore()
</script>

<style scoped>
.panel {
  display: grid;
  gap: 12px;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

article {
  border: 1px solid #d7dee7;
  background: #fff;
  border-radius: 10px;
  padding: 12px;
}

h3 {
  font-size: 14px;
  color: #466083;
}
.highlight {
  font-size: 24px;
  font-weight: bold;
  color: #4f46e5;
  margin-top: 8px;
}
.features-section {
  margin-top: 24px;
  background: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}
.features-section ul {
  margin-top: 10px;
  padding-left: 20px;
  line-height: 1.8;
  color: #374151;
}
</style>
