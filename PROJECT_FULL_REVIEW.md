# Vue Restart 全项目复盘（从0到结算）

本文是 `vue-restart` 项目的完整学习回顾，覆盖从项目初始化、路由、组件通信、状态管理、接口接入、鉴权，到结算状态机的全流程。

---

## 1. 项目总目标与技术路线

### 1.1 最终目标
1. 用 Vue3 完成一个可运行的电商前端闭环。
2. 不是只做页面，而是建立工程化结构。
3. 具备“可继续扩展到真实项目”的代码组织方式。

### 1.2 技术栈
1. Vue 3 + `<script setup>`
2. Vue Router（含路由守卫）
3. Pinia（用户和购物车状态）
4. Axios（请求实例 + 拦截器）
5. Fake Store API（商品与登录接口）
6. localStorage（状态持久化）

### 1.3 架构分层思路
1. `views`：页面展示与交互触发
2. `composables`：商品领域逻辑（筛选、排序、分页）
3. `stores`：跨页面全局状态（用户、购物车）
4. `api`：网络请求与数据适配
5. `utils`：工具函数（价格格式化、分类映射、存储封装）

---

## 2. 阶段一：项目初始化与基础骨架

### 2.1 做了什么
1. 创建新项目 `vue-restart`（Vite + Vue）。
2. 安装并接入 `vue-router`、`pinia`。
3. 建立首页、任务页、练习页、个人页、404 页面骨架。
4. 顶部导航统一放在 `App.vue`。

### 2.2 核心思路
1. 先把“项目壳子”搭稳定，再做业务。
2. 固定一个项目持续迭代，避免重复开新坑。

### 2.3 关键代码
文件：`src/main.js`
```js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
```

---

## 3. 阶段二：路由体系与导航流

### 3.1 做了什么
1. 配置基础路由：`/`、`/tasks`、`/profile`、`/practise`、`/:id`、`404`。
2. 增加动态路由：`/practise/:id`。
3. 列表页点击商品跳详情页。

### 3.2 核心思路
1. 路由负责页面切换，不负责复杂业务状态。
2. 页面之间通过 `id` 参数传递最小信息。

### 3.3 关键代码
文件：`src/router/index.js`
```js
{
  path: '/practise/:id',
  name: 'practiseDetails',
  component: PractiseDetailsView
}
```

---

## 4. 阶段三：组件通信（父子协作）

### 4.1 做了什么
1. `PractiseView` 作为父组件渲染商品列表。
2. `PractiseSonView` 作为子组件展示单个商品卡片。
3. 使用 `props + emit + slot` 完成通信。

### 4.2 核心思路
1. 子组件只负责展示和抛事件，不持有业务主逻辑。
2. 父组件集中处理跳转、加购等业务行为。

### 4.3 关键代码
文件：`src/views/PractiseSonView.vue`
```js
const props = defineProps({
  product: { type: Object, required: true },
  categoryName: { type: String, default: '' }
})

const emit = defineEmits(['add-to-cart', 'click-card'])

const handleAddToCart = () => emit('add-to-cart', props.product)
const handleCardClick = () => emit('click-card', props.product.id)
```

---

## 5. 阶段四：Pinia 与本地持久化

### 5.1 做了什么
1. 封装 `storage` 工具：`save/load/remove`。
2. 建立 `user` store：登录态与用户资料持久化。
3. 建立 `cart` store：购物车 items 持久化。

### 5.2 核心思路
1. 页面不直接写 localStorage。
2. 状态变化统一走 store action。
3. 刷新后状态可恢复，保证真实体验。

### 5.3 关键代码
文件：`src/utils/storage.js`
```js
const PREFIX = 'vue-restart'
export function save(key, value) {
  localStorage.setItem(`${PREFIX}:${key}`, JSON.stringify(value))
}
export function load(key, fallback) {
  const raw = localStorage.getItem(`${PREFIX}:${key}`)
  return raw ? JSON.parse(raw) : fallback
}
```

文件：`src/stores/cart.js`
```js
state: () => ({ items: load('cart', []) }),
actions: {
  addItem(product) { ...; save('cart', this.items) },
  clearCart() { this.items = []; remove('cart') }
}
```

---

## 6. 阶段五：商品逻辑抽离到 composable

### 6.1 做了什么
1. 建立 `useProducts`，集中管理商品列表状态。
2. 页面筛选、排序、分页从 `PractiseView` 下沉到 composable。
3. 统一导出页面所需状态与方法。

### 6.2 核心思路
1. 页面只关心“用什么数据”，不关心“数据怎么算”。
2. 可复用逻辑应放进 composable，避免页面复制粘贴。

### 6.3 关键代码
文件：`src/composables/useProducts.js`
```js
const filteredProducts = computed(() => {
  let result = products.value
  if (categoryFilter.value) result = result.filter(p => p.category === categoryFilter.value)
  if (searchQuery.value) result = result.filter(p => p.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
  return result
})

const sortedProducts = computed(() => { ... })
const pagedProducts = computed(() => { ... })
```

---

## 7. 阶段六：接入 Fake Store API

### 7.1 做了什么
1. 建立 Axios 实例 `http.js`。
2. 建立商品模块 `api/modules/product.js`。
3. 做数据适配：第三方字段转项目字段。
4. `useProducts` 的 `fetchInitData` 改为请求真实 API。

### 7.2 核心思路
1. 页面永远吃“统一字段”，不直接依赖第三方返回结构。
2. 第三方差异（如 `title`）在 API 适配层解决。

### 7.3 关键代码
文件：`src/api/modules/product.js`
```js
const adaptProduct = (apiData) => ({
  id: apiData.id,
  name: apiData.title,
  price: apiData.price * 7,
  category: apiData.category,
  image: apiData.image,
  stock: Math.floor(Math.random() * 90) + 10
})
```

文件：`src/composables/useProducts.js`
```js
const [productsData, categoriesData] = await Promise.all([
  getProductsAPI(),
  getCategoriesAPI()
])
products.value = productsData
categories.value = categoriesData
```

---

## 8. 阶段七：登录鉴权与路由守卫

### 8.1 做了什么
1. 新增登录页 `LoginView`。
2. 登录成功后写入 token 到 `user` store。
3. 路由守卫拦截受保护页面，带 `redirect` 回跳参数。
4. 请求拦截器自动带 token。
5. 响应拦截器处理 401：登出并跳转。

### 8.2 核心思路
1. “入口权限”用路由守卫控制。
2. “请求权限”用 Axios 拦截器控制。
3. 两者组合才是完整鉴权链路。

### 8.3 关键代码
文件：`src/router/index.js`
```js
if (to.meta.requiresAuth && !isAuthenticated) {
  return { name: 'login', query: { redirect: to.fullPath } }
}
```

文件：`src/api/http.js`
```js
if (token) config.headers.Authorization = `Bearer ${token}`
if (error.response?.status === 401) {
  userStore.logout()
  router.replace({ name: 'home', query: { redirect: router.currentRoute.value.fullPath } })
}
```

---

## 9. 阶段八：登录表单体验升级

### 9.1 做了什么
1. 字段校验（用户名、密码长度）。
2. `blur` 校验 + `submit` 全量校验。
3. 提交中禁用按钮、防重复提交。
4. 错误信息就地展示，不只用 alert。
5. 登录后根据 `redirect` 回跳。

### 9.2 核心思路
1. 表单体验是业务可用性的关键，不只是“能请求”。
2. 前端先拦明显无效输入，减少无意义请求。

### 9.3 关键代码
文件：`src/views/LoginView.vue`
```js
if (isSubmitting.value) return
if (!validateForm()) return
isSubmitting.value = true
...
const redirectPath = route.query.redirect || '/'
router.push(redirectPath)
```

---

## 10. 阶段九：列表交互升级（排序、分页、加载态）

### 10.1 做了什么
1. 增加排序状态：`sortBy`、`sortOrder`。
2. 增加分页状态：`page`、`pageSize`、`totalPages`。
3. 区分首次加载与手动刷新：`isFirstLoading`、`isRefreshing`。
4. 增加错误重试、空状态、骨架屏。

### 10.2 核心思路
1. 处理顺序固定：过滤 -> 排序 -> 分页。
2. 任何筛选条件变化都重置到第一页。
3. 手动刷新时尽量不闪屏，提升体验。

### 10.3 关键代码
文件：`src/composables/useProducts.js`
```js
watch([searchQuery, categoryFilter, sortBy, sortOrder], () => {
  page.value = 1
})
```

文件：`src/views/PractiseView.vue`
```vue
<div v-else-if="isFirstLoading" class="products-list">
  <div v-for="i in 6" :key="i" class="skeleton-card"></div>
</div>
```

---

## 11. 阶段十：结算状态机（从按钮到完整流程）

### 11.1 做了什么
1. 引入结算状态机：`idle / confirming / submitting / success / failed`。
2. 增加确认弹窗（订单数量、金额、确认操作）。
3. 增加提交中态（loading + 禁止重复提交）。
4. 增加成功态（订单号、金额、时间）。
5. 增加失败态（错误原因、重试）。
6. 保证“成功才清车，失败不清车”。

### 11.2 核心思路
1. 下单是多步骤流程，不能只靠一个 `alert`。
2. 明确状态机，能避免逻辑缠绕。
3. 用户必须看到过程与结果，体验才闭环。

### 11.3 关键代码
文件：`src/views/PractiseView.vue`
```js
const checkoutState = ref('idle')
const orderResult = ref(null)
const orderErrorMsg = ref('')

const openConfirm = () => { ...; checkoutState.value = 'confirming' }

const executeCheckout = async () => {
  checkoutState.value = 'submitting'
  try {
    const result = await submitOrder(payload)
    cartStore.clearCart()
    orderResult.value = result
    checkoutState.value = 'success'
  } catch (err) {
    orderErrorMsg.value = err.message
    checkoutState.value = 'failed'
  }
}
```

---

## 12. 关键数据流（建议背下来）

### 12.1 商品流
1. `useProducts.fetchInitData` 请求商品与分类。
2. `api/modules/product` 适配第三方字段。
3. `useProducts` 内部做过滤、排序、分页。
4. `PractiseView` 只渲染 `pagedProducts`。

### 12.2 鉴权流
1. `LoginView` 调用 `login API`。
2. 成功后 `userStore.login()` 写 token + profile + localStorage。
3. 路由守卫检查 `isLoggedIn`。
4. Axios 请求头自动带 token。
5. 401 时自动 logout 并跳转。

### 12.3 购物车与结算流
1. 商品卡片抛 `add-to-cart` 事件。
2. 父组件调用 `cartStore.addItem`。
3. 结算前 `checkHasOutOfStock` 校验。
4. 结算状态机推进并反馈结果。
5. 成功后扣库存 + 清购物车。

---

## 13. 你当前项目的优势与边界

### 13.1 已经具备的优势
1. 结构分层清晰，后续可扩展。
2. 核心业务闭环完整（登录->浏览->加购->结算）。
3. 有明确状态管理和持久化能力。
4. 有真实接口接入经验与适配意识。

### 13.2 当前边界（用于后续优化）
1. `stock` 为模拟值，非后端真实字段。
2. 详情页错误态可进一步细化。
3. 某些组件事件可再统一命名使用（例如继续统一 `click-card`）。

---

## 14. 复习建议（建议按顺序）

1. 先复习路由守卫 + 登录回跳。
2. 再复习 `useProducts` 三段式数据处理（过滤/排序/分页）。
3. 再复习 Pinia 购物车与持久化。
4. 最后复习结算状态机与错误处理。

---

## 15. 最简答辩话术（可直接用于面试/汇报）

“这个项目我重点做了三件事：第一，按工程化分层把页面逻辑下沉到 composable/store/api，避免页面臃肿；第二，打通了鉴权闭环，包括登录、路由守卫、请求拦截和 401 处理；第三，把结算流程做成了状态机，不再是单一按钮，具备确认、提交中、成功、失败与重试完整反馈。”

