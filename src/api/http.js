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

http.interceptors.response.use(
    response => response.data,
    error => {
        console.error('API Error:', error)
        throw error
    }
)

http.interceptors.response.use(
    response => response.data,
    error => {
        const message = error.response?.data?.message || error.message
        alert(`API Error: ${message}`)
        return Promise.reject(error)
    }
)


export default http
