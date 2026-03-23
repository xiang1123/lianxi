<template>
  <div class="product-manager">
    <div class="page-header">
      <h2>商品管理中心</h2>
    </div>

    <div class="dashboard-panels">
      <div class="panel-card statistics">
        <div class="panel-header">
          <h3>📊 数据统计</h3>
        </div>
        <div class="panel-body">
          <p>
            电子产品数量: <strong>{{ electronicsCount || 0 }}</strong> 件
          </p>
          <p>
            所有商品均价: <strong>{{ formatPrice(averagePrice) }}</strong>
          </p>
        </div>
      </div>

      <div class="panel-card cart-summary">
        <div class="panel-header">
          <h3>🛒 购物车结算</h3>
        </div>
        <div class="panel-body">
          <p>
            已选商品: <strong>{{ cartItemCount }}</strong> 件
          </p>
          <p>
            总计金额:
            <strong class="price-highlight">{{
              formatPrice(cartTotal)
            }}</strong>
          </p>

          <p v-if="hasOutOfStockItems" class="warning-text">
            ⚠️ 购物车中有商品库存不足，请调整数量
          </p>
        </div>
        <div class="panel-footer">
          <button
            @click="openConfirm"
            class="checkout-btn"
            :disabled="cartStore.items.length === 0 || hasOutOfStockItems"
          >
            立即结算
          </button>
        </div>
      </div>
    </div>

    <div class="control-console">
      <div class="search-group">
        <input
          v-model="searchQuery"
          placeholder="搜索商品名称..."
          class="search-input"
        />
        <select v-model="categoryFilter" class="category-filter">
          <option value="">所有分类</option>

          <option v-for="cat in categories" :key="cat" :value="cat">
            {{ getCategoryName(cat) }}
          </option>
        </select>
      </div>

      <div class="action-group">
        <div class="sort-controls">
          <button
            @click="toggleSort('price')"
            :class="{ active: sortBy === 'price' }"
          >
            价格排序
            {{ sortBy === 'price' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
          </button>
          <button
            @click="toggleSort('name')"
            :class="{ active: sortBy === 'name' }"
          >
            名称排序
            {{ sortBy === 'name' ? (sortOrder === 'asc' ? 'A-Z' : 'Z-A') : '' }}
          </button>
        </div>

        <button
          @click="fetchInitData(true)"
          class="refresh-btn"
          :disabled="isRefreshing || isFirstLoading"
        >
          {{ isRefreshing ? '刷新中...' : '手动刷新' }}
        </button>
      </div>
    </div>

    <div class="main-content">
      <div v-if="error" class="status-state error-state">
        <span class="status-icon">❌</span>
        <p>{{ error }}</p>
        <button @click="fetchInitData(false)" class="primary-btn mt-3">
          重新尝试
        </button>
      </div>

      <div v-else-if="isFirstLoading" class="products-list">
        <div v-for="i in 6" :key="i" class="skeleton-card"></div>
      </div>

      <template v-else>
        <div v-if="totalCount === 0" class="status-state empty-state">
          <span class="status-icon">📭</span>
          <p>没有找到符合条件的商品，换个关键词试试吧</p>
          <button @click="resetFilters" class="primary-btn mt-3">
            清空筛选条件
          </button>
        </div>

        <div v-else>
          <div class="list-header">
            <span
              >为您找到 <strong>{{ totalCount }}</strong> 件商品</span
            >
          </div>

          <div class="products-list">
            <PractiseSonView
              v-for="product in pagedProducts"
              :key="product.id"
              :product="product"
              @add-to-cart="addToCart"
              @click="handleGotoDetail(product.id)"
            />
          </div>

          <div class="pagination">
            <button @click="prevPage" :disabled="page === 1" class="page-btn">
              上一页
            </button>
            <div class="page-numbers">
              <span
                v-for="p in totalPages"
                :key="p"
                @click="goToPage(p)"
                class="page-dot"
                :class="{ current: page === p }"
              >
                {{ p }}
              </span>
            </div>
            <button
              @click="nextPage"
              :disabled="page === totalPages"
              class="page-btn"
            >
              下一页
            </button>
          </div>
        </div>
      </template>
    </div>

    <div v-if="checkoutState !== 'idle'" class="checkout-modal-overlay">
      <div class="checkout-modal">
        <div v-if="checkoutState === 'confirming'" class="modal-content">
          <h3>🛒 确认订单</h3>
          <p>
            共计 <strong>{{ cartItemCount }}</strong> 件商品
          </p>
          <p>
            支付总金额：<strong class="price-highlight">{{
              formatPrice(cartTotal)
            }}</strong>
          </p>
          <div class="modal-actions mt-3">
            <button @click="resetCheckout" class="cancel-btn">返回修改</button>
            <button @click="executeCheckout" class="confirm-btn">
              确认支付
            </button>
          </div>
        </div>

        <div
          v-else-if="checkoutState === 'submitting'"
          class="modal-content submitting"
        >
          <div class="spinner"></div>
          <p>正在提交订单并锁定库存...</p>
          <p class="warning-text" style="background: transparent">
            请勿刷新或关闭页面
          </p>
        </div>

        <div
          v-else-if="checkoutState === 'success'"
          class="modal-content success"
        >
          <div class="status-icon">✅</div>
          <h3>下单成功！</h3>
          <div class="order-details">
            <p><strong>订单编号：</strong>{{ orderResult?.orderId }}</p>
            <p>
              <strong>实付金额：</strong>{{ formatPrice(orderResult?.amount) }}
            </p>
            <p><strong>下单时间：</strong>{{ orderResult?.time }}</p>
          </div>
          <button
            @click="resetCheckout"
            class="primary-btn mt-3"
            style="width: 100%"
          >
            返回商品列表
          </button>
        </div>

        <div
          v-else-if="checkoutState === 'failed'"
          class="modal-content failed"
        >
          <div class="status-icon">❌</div>
          <h3>下单失败</h3>
          <p class="error-msg">{{ orderErrorMsg }}</p>
          <div class="modal-actions mt-3">
            <button @click="resetCheckout" class="cancel-btn">稍后再试</button>
            <button @click="executeCheckout" class="retry-btn">重新提交</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue'
import PractiseSonView from './PractiseSonView.vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { formatPrice, getCategoryName } from '../utils/product'
import { useProducts } from '../composables/useProducts'

const router = useRouter()
const cartStore = useCartStore()

// 🌟 修复关键：解构出了 electronicsCount 和 averagePrice
const {
  products,
  checkHasOutOfStock,
  categories,
  searchQuery,
  categoryFilter,
  error,
  isFirstLoading,
  isRefreshing,
  sortBy,
  sortOrder,
  page,
  totalPages,
  totalCount,
  pagedProducts,
  fetchInitData,
  toggleSort,
  nextPage,
  prevPage,
  goToPage,
  electronicsCount,
  averagePrice,
} = useProducts()

const resetFilters = () => {
  searchQuery.value = ''
  categoryFilter.value = ''
}

const checkoutState = ref('idle')
const orderResult = ref(null)
const orderErrorMsg = ref('')

// ================= 业务计算与方法 =================
const cartItemCount = computed(() => {
  return cartStore.items.reduce((total, item) => total + item.quantity, 0)
})

const cartTotal = computed(() => {
  return cartStore.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  )
})

const hasOutOfStockItems = computed(() => {
  return checkHasOutOfStock(cartStore.items)
})

const addToCart = (product) => {
  cartStore.addItem(product)
}

const updateProductStock = (productId, quantity) => {
  // 🌟 修复关键：套上 Number()，确保 "1" 和 1 能够完美匹配！
  const product = products.value.find((p) => p.id === Number(productId))

  if (product) {
    product.stock -= quantity
  }
}

const submitOrder = async (cartItems) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const random = Math.random()
      if (random < 0.2) {
        reject({
          type: 'STOCK_ERROR',
          message: '业务异常：部分商品库存不足，已被抢空',
        })
      } else if (random < 0.35) {
        reject({
          type: 'NETWORK_ERROR',
          message: '网络超时：请检查您的网络连接',
        })
      } else if (random < 0.5) {
        reject({
          type: 'SERVER_ERROR',
          message: '服务异常：服务器繁忙 (500)，请稍后再试',
        })
      } else {
        resolve({
          success: true,
          orderId: 'ORD-' + Date.now(),
          amount: cartTotal.value,
          time: new Date().toLocaleString(),
        })
      }
    }, 1000)
  })
}

const openConfirm = () => {
  if (cartStore.items.length === 0) {
    alert('购物车为空，无法结算')
    return
  }
  if (hasOutOfStockItems.value) {
    alert('购物车中存在缺货商品，无法结算')
    return
  }

  checkoutState.value = 'confirming'
}

const executeCheckout = async () => {
  checkoutState.value = 'submitting'
  orderErrorMsg.value = ''

  try {
    const payload = cartStore.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
    }))

    const result = await submitOrder(payload)
    cartStore.items.forEach((item) => {
      updateProductStock(item.id, item.quantity)
    })
    cartStore.clearCart()
    orderResult.value = result
    checkoutState.value = 'success'
  } catch (err) {
    orderErrorMsg.value = err.message
    checkoutState.value = 'failed'
  }
}

const resetCheckout = () => {
  checkoutState.value = 'idle'
  orderResult.value = null
  orderErrorMsg.value = ''
}

const handleGotoDetail = (id) => {
  router.push(`/practise/${id}`)
}

onMounted(() => {
  fetchInitData()
})
</script>

<style scoped>
/* ================= 1. 全局变量 & 基础容器 ================= */
.product-manager {
  --primary: #4f46e5;
  --primary-hover: #4338ca;
  --danger: #ef4444;
  --bg-color: #f3f4f6;
  --card-bg: #ffffff;
  --border: #e5e7eb;
  --text-main: #1f2937;
  --text-muted: #6b7280;
  --radius: 10px;
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);

  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
  color: var(--text-main);
}

.page-header h2 {
  font-size: 28px;
  text-align: center;
  margin-bottom: 30px;
}

/* ================= 2. 顶部数据看板 (Flex 布局) ================= */
.dashboard-panels {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
}

.panel-card {
  flex: 1;
  background: var(--card-bg);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  background: #f9fafb;
  border-radius: var(--radius) var(--radius) 0 0;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
}

.panel-body {
  padding: 20px;
  flex: 1;
}

.panel-body p {
  margin: 8px 0;
  color: var(--text-muted);
}

.price-highlight {
  color: var(--danger);
  font-size: 20px;
}

.warning-text {
  color: var(--danger) !important;
  font-size: 13px;
  background: #fef2f2;
  padding: 8px;
  border-radius: 6px;
  margin-top: 12px !important;
}

.panel-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--border);
}

.checkout-btn {
  width: 100%;
  padding: 12px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
}

.checkout-btn:hover:not(:disabled) {
  background: var(--primary-hover);
}

.checkout-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

/* ================= 3. 控制台 (搜索/过滤/排序) ================= */
.control-console {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  background: var(--card-bg);
  padding: 20px;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  margin-bottom: 30px;
}

.search-group,
.action-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.search-input,
.category-filter {
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: 6px;
  outline: none;
}

.search-input:focus,
.category-filter:focus {
  border-color: var(--primary);
}

.sort-controls button {
  padding: 10px 14px;
  background: #f3f4f6;
  border: 1px solid var(--border);
  border-radius: 6px;
  cursor: pointer;
}

.sort-controls button.active {
  background: #e0e7ff;
  color: var(--primary);
  border-color: #c7d2fe;
  font-weight: bold;
}

.refresh-btn,
.primary-btn {
  padding: 10px 16px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

/* ================= 4. 状态展示 (加载/报错/空) ================= */
.status-state {
  text-align: center;
  padding: 60px 20px;
  background: var(--card-bg);
  border-radius: var(--radius);
  margin-top: 20px;
}

.status-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}

.skeleton-card {
  height: 320px;
  background: #e5e7eb;
  border-radius: var(--radius);
  animation: pulse 1.5s infinite ease-in-out;
}

@keyframes pulse {
  0%,
  100% {
    background-color: #f3f4f6;
  }
  50% {
    background-color: #e5e7eb;
  }
}

.mt-3 {
  margin-top: 16px;
}

/* ================= 5. 列表与分页 ================= */
.list-header {
  margin-bottom: 16px;
  text-align: right;
  color: var(--text-muted);
  font-size: 14px;
}

.products-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 24px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 40px;
}

.page-btn {
  padding: 8px 16px;
  border: 1px solid var(--border);
  background: white;
  border-radius: 6px;
  cursor: pointer;
}

.page-btn:disabled {
  background: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 8px;
}

.page-dot {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-dot:hover {
  background: #e5e7eb;
}

.page-dot.current {
  background: var(--primary);
  color: white;
  font-weight: bold;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .dashboard-panels {
    flex-direction: column;
  }
  .control-console {
    flex-direction: column;
    align-items: stretch;
  }
  .search-group,
  .action-group {
    flex-direction: column;
  }
}

/* ================= 6. 结算状态机弹窗 ================= */
.checkout-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.checkout-modal {
  background: white;
  width: 90%;
  max-width: 400px;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  animation: modalFadeIn 0.3s ease-out;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.modal-content h3 {
  font-size: 20px;
  margin-bottom: 16px;
  color: var(--text-main);
}

.modal-actions {
  display: flex;
  gap: 12px;
  width: 100%;
  margin-top: 24px;
}

.modal-actions button {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  color: #4b5563;
}
.cancel-btn:hover {
  background: #e5e7eb;
}

.confirm-btn {
  background: var(--primary);
  border: none;
  color: white;
}
.confirm-btn:hover {
  background: var(--primary-hover);
}

.retry-btn {
  background: #ef4444;
  border: none;
  color: white;
}
.retry-btn:hover {
  background: #dc2626;
}

.error-msg {
  color: #ef4444;
  background: #fef2f2;
  padding: 12px;
  border-radius: 8px;
  margin-top: 10px;
  width: 100%;
}

.order-details {
  background: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  width: 100%;
  text-align: left;
  margin-top: 10px;
}
.order-details p {
  margin: 6px 0;
  font-size: 14px;
}

/* 简单的 Loading 动画 */
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
