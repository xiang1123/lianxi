import { defineStore } from 'pinia'

const DAY_ONE_TASKS = [
  { id: 1, title: '完成 map/filter/reduce 练习', done: false },
  { id: 2, title: '完成 async/await 错误处理练习', done: false },
  { id: 3, title: '改造一个 Vue 页面并提交代码', done: false }
]

export const useLearningStore = defineStore('learning', {
  state: () => ({
    todayHours: 7,
    tasks: DAY_ONE_TASKS
  }),
  getters: {
    finishedCount: (state) => state.tasks.filter((task) => task.done).length,
    progressText() {
      return `${this.finishedCount}/${this.tasks.length}`
    }
  },
  actions: {
    toggleTask(id) {
      const target = this.tasks.find((task) => task.id === id)
      if (!target) return
      target.done = !target.done
    }
  }
})
