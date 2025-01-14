import axios from 'axios'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 5000
})

// 响应拦截器
request.interceptors.response.use(
  response => {
    return response
  },
  error => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export const getResources = (params) => {
  return request.get('/resources', { params })
}

export const getBillingInfo = () => {
  return request.get('/billing')
} 