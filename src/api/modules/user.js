import http from '../http'

export const login = async (data) => {
  return await http.post('/auth/login', data)
}
