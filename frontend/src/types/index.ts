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
  account_name: string    // 账号名称
  resource_type: string   // 资源类型
  resource_name: string   // 资源名称
  expired_time: string    // 到期时间
  differ_days: number     // 剩余天数
  platform: CloudPlatform // 云平台类型
}

/**
 * 账单信息接口
 */
export interface BillingInfo {
  id: number
  account_name: string     // 账号名称
  project_name: string     // 项目名称
  service_name: string     // 服务类型
  balance?: number         // 账户余额
  real_total_cost: number  // 实际费用
  platform: CloudPlatform  // 云平台类型
} 