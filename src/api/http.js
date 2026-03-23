import axios from 'axios'
import router from '@/router'
import { useUserStore } from '@/stores/user'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://fakestoreapi.com',
  timeout: 10000,
})

http.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    const token = userStore.token

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

http.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        alert('登录过期，请重新登录')
        const userStore = useUserStore()
        userStore.logout()
        router.replace({
          name: 'home',
          query: { redirect: router.currentRoute.value.fullPath },
        })
      } else if (error.response.status === 500) {
        alert('服务器错误，请稍后再试')
      }
    } else {
      console.error('网络异常,请求错误', error)
    }
    return Promise.reject(error)
  },
)

export default http
