<template>
  <section class="detail-page">
    <h2>商品详情页</h2>
    <p>当前商品 ID：{{ id }}</p>
    <RouterLink to="/practise">返回练习页</RouterLink>
    <div class="product-details" v-if="product">
      <div class="detail-card">
        <img :src="product.image" :alt="product.name" class="detail-image" />

        <div class="detail-info">
          <h3>{{ product.name }}</h3>
          <p class="category">分类: {{ getCategoryName(product.category) }}</p>
          <p class="price">单价: {{ formatPrice(product.price) }}</p>
          <p class="stock">当前库存: {{ product.stock }}件</p>

          <button
            @click="handleAddToCart"
            :disabled="product.stock <= 0"
            class="add-btn"
          >
            {{ product.stock > 0 ? '加入购物车' : '已售罄' }}
          </button>
        </div>
      </div>
    </div>

    <div v-else class="loading">正在加载商品信息或商品不存在...</div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { formatPrice, getCategoryName } from '../utils/product'
import { getProductByIdAPI } from '@/api/modules/product'

const cartStore = useCartStore()

const product = ref(null)
const loading = ref(true)
const route = useRoute()
const id = computed(() => route.params.id)

onMounted(async () => {
  try {
    loading.value = true
    // 无论用户是不是从列表页点进来的，直接通过真实接口拿该商品最新数据
    product.value = await getProductByIdAPI(route.params.id)
  } catch (error) {
    console.error('获取详情失败', error)
  } finally {
    loading.value = false
  }
})

// 3. 核心逻辑：加入购物车
const handleAddToCart = () => {
  if (product.value) {
    // 极其清爽！只有这一行核心代码
    cartStore.addItem(product.value)
    alert('已成功加入购物车！')
  }
}
</script>

<style scoped>
.detail-page {
  display: grid;
  gap: 10px;
  background: #fff;
  border: 1px solid #d7dee7;
  border-radius: 10px;
  padding: 14px;
}
/* 随便写点基础样式让它好看点 */
.detail-card {
  display: flex;
  gap: 20px;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  max-width: 600px;
}
.detail-image {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
}
.add-btn {
  margin-top: 15px;
  padding: 10px 20px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.add-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
