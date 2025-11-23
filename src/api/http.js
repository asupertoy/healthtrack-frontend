import axios from 'axios'

const http = axios.create({
    baseURL: 'http://localhost:8080/api',
    timeout: 5000,
})

// 在每次请求中自动附带 token（如果已登录）
http.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// 统一响应处理：直接返回 data；统一错误提示
http.interceptors.response.use(
    response => response.data,
    error => {
        const message = error.response?.data?.message || error.message
        console.error('API Error:', message)
        alert(`API Error: ${message}`)
        return Promise.reject(error)
    }
)

export default http
