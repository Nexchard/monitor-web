import { TencentResource } from '../models/tencent'
import { HuaweiResource } from '../models/huawei'

interface ResourceResponse {
  id: number
  account_name: string
  resource_type: string
  resource_name: string
  expired_time: Date
  differ_days?: number
  platform: string
}

export class ResourceService {
  async getAllResources() {
    try {
      const tencentResources = await TencentResource.findAll()
      const huaweiResources = await HuaweiResource.findAll()

      console.log('Raw Tencent resources:', tencentResources)
      console.log('Raw Huawei resources:', huaweiResources)

      const formattedTencentResources = tencentResources.map(resource => ({
        id: resource.id,
        account_name: resource.account_name,
        resource_type: resource.resource_type,
        resource_name: resource.resource_name,
        expired_time: resource.expired_time,
        differ_days: resource.differ_days,
        platform: 'tencent'
      }))

      const formattedHuaweiResources = huaweiResources.map(resource => ({
        id: resource.id,
        account_name: resource.account_name,
        resource_type: resource.resource_type,
        resource_name: resource.resource_name,
        expired_time: resource.expired_time,
        differ_days: resource.differ_days,
        platform: 'huawei'
      }))

      const allResources = [...formattedTencentResources, ...formattedHuaweiResources]
      console.log('Formatted resources:', allResources)
      
      return allResources
    } catch (error) {
      console.error('Error in getAllResources:', error)
      throw error
    }
  }
} 