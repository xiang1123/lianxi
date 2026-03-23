import http from '../http'

const adaptProduct = (apiData) => {
  return {
    id: apiData.id,
    name: apiData.title, // 【转换】title -> name
    price: apiData.price * 7, // 【转换】美元 -> 人民币（可选）
    category: apiData.category,
    image: apiData.image,
    description: apiData.description,
    rating: apiData.rating, // 保留原有有用字段
    // 【造假数据】Fake Store 没有库存，我们随机生成 10~99 的库存
    stock: Math.floor(Math.random() * 90) + 10,
  }
}

export const getProductsAPI = async () => {
  const rawData = await http.get('/products')
  return rawData.map((item) => adaptProduct(item))
}
// 2. 获取单个商品详情
export const getProductByIdAPI = async (id) => {
  const rawData = await http.get(`/products/${id}`)
  return adaptProduct(rawData) // 单个对象直接洗
}

// 3. 获取所有分类列表
export const getCategoriesAPI = async () => {
  // 这个返回的是简单的字符串数组 ['electronics', 'jewelery', ...]，不需要洗
  return await http.get('/products/categories')
}

// 4. 根据分类获取商品
export const getProductsByCategoryAPI = async (category) => {
  const rawData = await http.get(`/products/category/${category}`)
  return rawData.map((item) => adaptProduct(item))
}
