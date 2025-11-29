import axios from 'axios'
import { useUserStore } from '../stores/userStore'

const http = axios.create({
    baseURL: 'http://localhost:8080/api',
    timeout: 10000,
})

// 刷新相关的状态与工具
let isRefreshing = false
let refreshSubscribers = []

function subscribeTokenRefresh(callback) {
    refreshSubscribers.push(callback)
}

function onRefreshed(newToken) {
    refreshSubscribers.forEach(cb => cb(newToken))
    refreshSubscribers = []
}

function getAccessToken() {
    return localStorage.getItem('token')
}

// 为避免拦截器互相影响，刷新时使用一个独立的 axios 实例
const refreshHttp = axios.create({
    baseURL: 'http://localhost:8080/api',
    timeout: 10000,
})

// 请求拦截器：自动附加 Authorization 头
http.interceptors.request.use(
    config => {
        const token = getAccessToken()
        if (token) {
            config.headers = config.headers || {}
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    error => Promise.reject(error)
)

// 响应拦截器：处理 401 并尝试刷新 token
http.interceptors.response.use(
    response => response,
    async error => {
        const { response, config } = error

        if (!response) {
            // 网络错误或超时
            return Promise.reject(error)
        }

        if (response.status !== 401) {
            return Promise.reject(error)
        }

        // 避免重复刷新
        if (!isRefreshing) {
            isRefreshing = true
            const userStore = useUserStore()
            const refreshToken = userStore.refreshToken || localStorage.getItem('refreshToken')

            if (!refreshToken) {
                isRefreshing = false
                userStore.logout()
                return Promise.reject(error)
            }

            try {
                const data = await refreshHttp.post('/auth/refresh', { refreshToken })
                // 更新 store 和 localStorage
                userStore.accessToken = data.data.accessToken
                userStore.refreshToken = data.data.refreshToken
                if (userStore.accessToken) {
                    localStorage.setItem('token', userStore.accessToken)
                }
                if (userStore.refreshToken) {
                    localStorage.setItem('refreshToken', userStore.refreshToken)
                }

                isRefreshing = false
                onRefreshed(userStore.accessToken)
            } catch (e) {
                isRefreshing = false
                const userStore2 = useUserStore()
                userStore2.logout()
                return Promise.reject(e)
            }
        }

        // 将当前请求挂起，等待刷新完成后重试
        const retryOriginalRequest = new Promise(resolve => {
            subscribeTokenRefresh(newToken => {
                const newConfig = { ...config }
                newConfig.headers = newConfig.headers || {}
                newConfig.headers.Authorization = `Bearer ${newToken}`
                resolve(http(newConfig))
            })
        })

        return retryOriginalRequest
    }
)

export default http
