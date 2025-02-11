import axios, { AxiosError } from 'axios'
import type { ResourceInfo, AccountBalance, BillingDetail } from '../types'

interface ApiErrorResponse {
  error: string;
  details: string;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
})

interface ExpiryResourcesParams {
  days?: number
  order?: 'asc' | 'desc'
}

// 获取资源到期信息
export const getExpiryResources = async (params?: ExpiryResourcesParams): Promise<ResourceInfo[]> => {
  try {
    const response = await api.get('/resources/expiry', { params })
    return response.data || []
  } catch (error) {
    console.error('Get expiry resources error:', error)
    handleApiError(error as AxiosError<ApiErrorResponse>)
    return []
  }
}

// 获取账户余额信息
export const getAccountBalances = async (): Promise<AccountBalance[]> => {
  try {
    const response = await api.get('/accounts/balances')
    return response.data || []
  } catch (error) {
    console.error('Get account balances error:', error)
    handleApiError(error as AxiosError<ApiErrorResponse>)
    return []
  }
}

// 获取账单明细
export const getBillingDetails = async (): Promise<BillingDetail[]> => {
  try {
    const response = await api.get('/bills/details')
    return response.data || []
  } catch (error) {
    console.error('Get billing details error:', error)
    handleApiError(error as AxiosError<ApiErrorResponse>)
    return []
  }
}

// 更新资源备注
export const updateResourceRemark = async (resourceId: number, remark: string): Promise<void> => {
  try {
    const response = await api.put(`/resources/${resourceId}/remark`, { remark });
    if (!response.data) {
      throw new Error('更新备注失败：服务器没有返回数据');
    }
  } catch (error) {
    console.error('Update resource remark error:', error);
    if (error instanceof AxiosError && error.response?.data) {
      throw new Error(`更新备注失败：${error.response.data.details || error.response.data.error || '未知错误'}`);
    }
    throw new Error('更新备注失败：' + (error instanceof Error ? error.message : '未知错误'));
  }
};

// 添加手动同步方法
export const syncData = async (): Promise<void> => {
  try {
    const response = await api.post('/sync');
    if (!response.data) {
      throw new Error('同步失败：服务器没有返回数据');
    }
  } catch (error) {
    console.error('Sync data error:', error);
    if (error instanceof AxiosError && error.response?.data) {
      throw new Error(`同步失败：${error.response.data.details || error.response.data.error || '未知错误'}`);
    }
    throw new Error('同步失败：' + (error instanceof Error ? error.message : '未知错误'));
  }
};

// 统一处理 API 错误
const handleApiError = (error: AxiosError<ApiErrorResponse>) => {
  if (error.response) {
    // 服务器返回错误状态码
    console.error('Response error:', error.response.data)
    throw new Error(error.response.data?.details || error.response.data?.error || '服务器返回错误')
  } else if (error.request) {
    // 请求发送成功但没有收到响应
    console.error('Request error:', error.request)
    throw new Error('无法连接到服务器，请检查网络连接')
  } else {
    // 请求配置出错
    console.error('Error:', error.message)
    throw new Error('请求配置错误')
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