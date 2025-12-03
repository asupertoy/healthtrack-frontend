import http from './http'

export default {
  // 获取所有 Provider
  getProviders() {
    return http.get('/providers').then(res => res.data)
  },

  // 根据 ID 获取单个 Provider
  getProviderById(providerId) {
    return http.get(`/providers/${providerId}`).then(res => res.data)
  },
}

