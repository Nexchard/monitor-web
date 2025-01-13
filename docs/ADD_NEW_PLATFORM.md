# 添加新平台支持指南

本文档说明如何在系统中添加新的云平台支持。以下是需要修改的文件和步骤：

## 1. 添加平台类型

在 `frontend/src/types/index.ts` 中添加新平台：

```typescript
export enum CloudPlatform {
  TENCENT = 'tencent',
  ALIYUN = 'aliyun',
  HUAWEI = 'huawei',
  AWS = 'aws',
  NEW_PLATFORM = 'new_platform'  // 添加新平台
}
```

## 2. 添加平台图标

### 2.1 添加图标定义
在 `frontend/src/components/icons/index.ts` 中添加新平台的图标：

```typescript
export const PlatformIcons = {
  // ... 现有平台
  new_platform: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
    <path fill="currentColor" d="..."/>
  </svg>`
}
```

### 2.2 添加图标样式
在 `frontend/src/components/PlatformIcon.vue` 中添加新平台的样式：

```css
.platform-icon--new_platform {
  color: #your-color-code;
}
```

## 3. 更新平台配置

在 `frontend/src/views/ResourceList.vue` 中添加新平台配置：

```typescript
const platforms = [
  // ... 现有平台
  {
    label: '新平台',
    value: CloudPlatform.NEW_PLATFORM,
    icon: 'new_platform'
  }
]
```

## 4. 后端支持

### 4.1 创建数据模型
在 `backend/src/models/` 下创建新文件 `newplatform.ts`：

```typescript
import { Model, DataTypes } from 'sequelize'
import { dbManager } from '../config/database'

export class NewPlatformResource extends Model {
  public id!: number
  public account_name!: string
  public resource_type!: string
  public resource_name!: string
  public expired_time!: Date
  public differ_days?: number
}

NewPlatformResource.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    account_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    resource_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    resource_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    expired_time: {
      type: DataTypes.DATE,
      allowNull: false
    },
    differ_days: {
      type: DataTypes.INTEGER
    }
  },
  {
    sequelize: dbManager.getConnection('primary'),
    tableName: 'new_platform_resources'
  }
)
```

### 4.2 更新资源服务
在 `backend/src/services/resourceService.ts` 中添加新平台支持：

```typescript
import { NewPlatformResource } from '../models/newplatform'

export class ResourceService {
  async getAllResources() {
    try {
      // ... 现有代码 ...
      
      // 获取新平台资源
      const newPlatformResources = await NewPlatformResource.findAll()
      
      // 格式化新平台数据
      const formattedNewPlatformResources = newPlatformResources.map(resource => ({
        id: resource.id,
        account_name: resource.account_name,
        resource_type: resource.resource_type,
        resource_name: resource.resource_name,
        expired_time: resource.expired_time,
        differ_days: resource.differ_days,
        platform: 'new_platform'
      }))

      // 合并所有资源
      const allResources = [
        ...formattedTencentResources,
        ...formattedNewCloudResources,
        ...formattedNewPlatformResources  // 添加新平台数据
      ]
      
      return allResources
    } catch (error) {
      console.error('Error in getAllResources:', error)
      throw error
    }
  }
}
```

### 4.3 数据库迁移
创建数据库迁移文件来添加新的表：

```sql
CREATE TABLE new_platform_resources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  account_name VARCHAR(255) NOT NULL,
  resource_type VARCHAR(255) NOT NULL,
  resource_name VARCHAR(255) NOT NULL,
  expired_time DATETIME NOT NULL,
  differ_days INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 5. 测试

1. 确保所有修改都已保存
2. 重启前端和后端服务
3. 测试新平台的资源是否正确显示
4. 测试筛选功能是否正常工作
5. 检查图标和样式是否正确显示

## 注意事项

1. 确保新平台的标识符（如 'new_platform'）在所有地方保持一致
2. 新平台的图标应该符合整体设计风格
3. 数据库字段类型应与其他平台保持一致
4. 添加新平台后要进行完整的功能测试

## 可选优化

1. 添加新平台特有的功能或字段
2. 为新平台添加专门的数据验证逻辑
3. 添加新平台的错误处理机制
4. 更新文档和注释 