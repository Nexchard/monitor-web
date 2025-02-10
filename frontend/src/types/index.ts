/**
 * 云平台类型枚举
 */
export enum CloudPlatform {
  TENCENT = 'tencent',  // 腾讯云
  HUAWEI = 'huawei'     // 华为云
}

/**
 * 资源信息接口
 */
export interface ResourceInfo {
  id: number
  cloud_provider: string
  account_name: string
  resource_type: string
  resource_id: string
  resource_name: string
  project_name: string
  region: string
  zone: string
  expire_time: string
  remaining_days: number
  status: string
  batch_number?: string
}

/**
 * 账户余额信息接口
 */
export interface AccountBalance {
  id: number
  cloud_provider: string
  account_name: string
  balance: string | number  // 修改为支持字符串或数字类型
  currency: string
  balance_type?: string
  expire_time?: string
  batch_number?: string
  created_at?: string
  updated_at?: string
}

/**
 * 账单明细接口
 */
export interface BillingDetail {
  id: number
  cloud_provider: string
  account_name: string
  project_name: string
  service_type: string
  amount: string | number
  currency: string
  billing_cycle: string
  billing_date?: string
  batch_number?: string
  created_at?: string
  updated_at?: string
} 