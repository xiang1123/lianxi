import { defineStore } from 'pinia'
import { load, remove, save } from '../utils/storage'

const DEFAULT_USER = {
  token: '',
  profile: null,
}

export const useUserStore = defineStore('user', {
  state: () => load('user', DEFAULT_USER),
  getters: {
    isLoggedIn: (state) => Boolean(state.token),
  },
  actions: {
    login(payload) {
      this.token = payload.token
      this.profile = {
        username: payload.username,
        role: 'student',
      }
      save('user', { token: this.token, profile: this.profile })
    },
    logout() {
      this.token = ''
      this.profile = null
      remove('user')
    },
  },
})
