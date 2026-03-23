const CATEGORY_MAP = {
  electronics: '电子产品',
  jewelery: '珠宝首饰',
  "men's clothing": '男装',
  "women's clothing": '女装',
}

export function getCategoryName(category) {
  return CATEGORY_MAP[category] || category
}

export function formatPrice(price) {
  return `¥${Number(price).toFixed(2)}`
}
