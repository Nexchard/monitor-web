import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const getResources = async (params: { warningDays: number }) => {
  try {
    const response = await api.get('/api/resources', { params })
    console.log('Resources API response:', response)
    return response
  } catch (error) {
    console.error('Resources API error:', error)
    throw error
  }
}

export const getBillingInfo = async () => {
  try {
    const response = await api.get('/api/billings')
    console.log('Billings API response:', response)
    return response
  } catch (error) {
    console.error('Billings API error:', error)
    throw error
  }
}

// 请求拦截器
api.interceptors.request.use(
  config => {
    console.log('API Request:', config)
    return config
  },
  error => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    console.log('API Response:', response)
    return response
  },
  error => {
    console.error('API Response Error:', error)
    return Promise.reject(error)
  }
)

export default api 