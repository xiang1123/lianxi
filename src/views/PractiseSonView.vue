<template>
  <div v-if="product" class="product-card" @click="handleCardClick">
    <div class="product-image">
      <img :src="product.image" :alt="product.name" />
    </div>
    <div class="product-info">
      <h3>
        {{ product.name }}
        <slot></slot>
      </h3>
      <p class="category">{{ categoryName }}</p>
      <p class="price">¥{{ product.price.toFixed(2) }}</p>
      <p class="stock">库存: {{ product.stock }}</p>
      <div class="product-actions">
        <button @click.stop="handleAddToCart" :disabled="product.stock <= 0">
          {{ product.stock > 0 ? '加入购物车' : '缺货' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// 【重点 1：接收 Props】
const props = defineProps({
  product: {
    type: Object,
    required: true, // 必须传商品对象
  },
  categoryName: {
    type: String,
    default: '',
  },
})

// 【重点 2：定义 Emits】
// 声明这个组件会向外发送两个事件
const emit = defineEmits(['add-to-cart', 'click-card'])

// 触发“加入购物车”事件，并把当前商品数据传给父组件
const handleAddToCart = () => {
  emit('add-to-cart', props.product)
}

// 触发“点击卡片”事件，并传出商品 ID
const handleCardClick = () => {
  emit('click-card', props.product.id)
}
</script>

<style scoped>
.product-card {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  transition:
    transform 0.3s,
    box-shadow 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.product-image {
  height: 150px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  padding: 15px;
}

.product-info h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #333;
}

.category {
  color: #666;
  font-size: 14px;
  margin: 5px 0;
}

.price {
  font-weight: bold;
  color: #e91e63;
  font-size: 18px;
  margin: 10px 0;
}

.stock {
  font-size: 14px;
  color: #666;
  margin: 5px 0;
}

.product-actions button {
  width: 100%;
  padding: 8px;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.product-actions button:hover:not(:disabled) {
  background-color: #0b7dda;
}

.product-actions button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>
