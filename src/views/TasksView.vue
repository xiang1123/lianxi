<template>
  <section class="panel">
    <h2>Day1 任务看板</h2>
    <p>完成一项就勾选一项，目标今天做完 3/3。</p>

    <ul>
      <li v-for="item in learningStore.tasks" :key="item.id">
        <label>
          <input
            :checked="item.done"
            type="checkbox"
            @change="learningStore.toggleTask(item.id)"
          />
          {{ item.title }}
        </label>
      </li>
    </ul>
  </section>
</template>

<script setup>
import { useLearningStore } from '../stores/learning'

const learningStore = useLearningStore()
</script>

<style scoped>
.panel {
  background: #fff;
  border: 1px solid #d7dee7;
  border-radius: 10px;
  padding: 14px;
}

ul {
  margin-top: 12px;
  display: grid;
  gap: 10px;
}

li {
  list-style: none;
}

label {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
