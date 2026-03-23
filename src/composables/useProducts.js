import { ref, computed, watch } from 'vue'
import { getProductsAPI, getCategoriesAPI } from '@/api/modules/product'

export function useProducts() {
  const products = ref([])
  const categories = ref([])

  const searchQuery = ref('')
  const categoryFilter = ref('')

  const isFirstLoading = ref(false)
  const isRefreshing = ref(false)
  const error = ref(null)

  const sortBy = ref('')
  const sortOrder = ref('asc')

  const page = ref(1)
  const pageSize = ref(6)

  const fetchInitData = async (isRefresh = false) => {
    if (isRefresh) {
      isRefreshing.value = true
    } else {
      isFirstLoading.value = true
    }
    error.value = null
    try {
      const [productsData, categoriesData] = await Promise.all([
        getProductsAPI(), // 拿所有商品
        getCategoriesAPI(), // 拿所有分类
      ])

      // 数据回来后，分别存入自己的仓库
      products.value = productsData
      categories.value = categoriesData
    } catch (err) {
      error.value = err.message || '获取商品失败，请检查网络'
    } finally {
      isFirstLoading.value = false
      isRefreshing.value = false
    }
  }

  const filteredProducts = computed(() => {
    let result = products.value

    // 过滤分类
    if (categoryFilter.value) {
      result = result.filter((p) => p.category === categoryFilter.value)
    }
    // 搜索
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter((p) => p.name.toLowerCase().includes(query))
    }
    return result
  })

  const sortedProducts = computed(() => {
    if (!sortBy.value) return filteredProducts.value

    return [...filteredProducts.value].sort((a, b) => {
      let valA = a[sortBy.value]
      let valB = b[sortBy.value]

      if (typeof valA === 'string') valA = valA.toLowerCase()
      if (typeof valB === 'string') valB = valB.toLowerCase()

      if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1
      if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1
      return 0
    })
  })

  const totalCount = computed(() => sortedProducts.value.length)
  const totalPages = computed(() =>
    Math.ceil(totalCount.value / pageSize.value),
  )

  const pagedProducts = computed(() => {
    const start = (page.value - 1) * pageSize.value
    const end = start + pageSize.value
    return sortedProducts.value.slice(start, end)
  })

  watch([searchQuery, categoryFilter, sortBy, sortOrder], () => {
    page.value = 1
  })

  const toggleSort = (field) => {
    if (sortBy.value === field) {
      // 已经是该字段，切换顺序
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    } else {
      // 新字段，默认升序
      sortBy.value = field
      sortOrder.value = 'asc'
    }
  }
  const nextPage = () => {
    if (page.value < totalPages.value) page.value++
  }
  const prevPage = () => {
    if (page.value > 1) page.value--
  }

  const goToPage = (p) => {
    if (p >= 1 && p <= totalPages.value) {
      page.value = p // 这里就能正确找到外面的 page.value 啦！
    }
  }

  const electronicsCount = computed(() => {
    return products.value.filter((p) => p.category === 'electronics').length
  })

  const averagePrice = computed(() => {
    if (products.value.length === 0) return 0
    const total = products.value.reduce(
      (sum, product) => sum + Number(product.price || 0),
      0,
    )
    return total / products.value.length
  })

  const findProductById = (id) => {
    return products.value.find((p) => p.id === Number(id))
  }

  const checkHasOutOfStock = (cartItems) => {
    return cartItems.some((item) => {
      const product = findProductById(item.id)
      return !product || product.stock < item.quantity
    })
  }

  const allInStock = computed(() => {
    // 使用every检查所有商品是否都有库存
    return products.value.every((product) => product.stock > 0)
  })

  const hasHighValueItems = computed(() => {
    // 使用some检查是否有高价值商品
    return products.value.some((product) => product.price > 500)
  })

  return {
    // 状态
    categories,
    searchQuery,
    categoryFilter,
    error,
    isFirstLoading,
    isRefreshing,
    sortBy,
    sortOrder,
    page,
    pageSize,
    totalPages,
    totalCount,
    // 最终展示数据
    pagedProducts,
    // 动作
    products, // 🌟 必须导出这个，因为页面扣库存要用到
    checkHasOutOfStock, // 🌟 必须导出这个，因为购物车校验要用
    fetchInitData,
    toggleSort,
    nextPage,
    prevPage,
    goToPage,
    electronicsCount,
    averagePrice,
  }
}
