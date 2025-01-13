# 添加新云平台指南

本文档描述了如何在系统中添加新的云平台支持。

## 步骤概览

1. 添加平台类型
2. 添加数据库支持
3. 修改后端接口
4. 更新前端组件

## 详细步骤

### 1. 添加平台类型

在 `frontend/src/types/index.ts` 中添加新平台：

```typescript
export enum CloudPlatform {
  TENCENT = 'tencent',  // 腾讯云
  HUAWEI = 'huawei',    // 华为云
  NEW_PLATFORM = 'new_platform'  // 新平台
}
```

### 2. 添加数据库支持

1. 创建新的数据库配置：

```env
# .env 文件
NEW_PLATFORM_DB_HOST=your_db_host
NEW_PLATFORM_DB_PORT=3306
NEW_PLATFORM_DB_USER=your_username
NEW_PLATFORM_DB_PASSWORD=your_password
NEW_PLATFORM_DB_NAME=your_db_name
```

2. 在 `backend/src/config/db.js` 中添加数据库连接：

```javascript
const newPlatformPool = mysql.createPool({
  host: process.env.NEW_PLATFORM_DB_HOST,
  port: process.env.NEW_PLATFORM_DB_PORT,
  user: process.env.NEW_PLATFORM_DB_USER,
  password: process.env.NEW_PLATFORM_DB_PASSWORD,
  database: process.env.NEW_PLATFORM_DB_NAME
})
```

### 3. 修改后端接口

在 `backend/src/routes/index.js` 中：

1. 添加新平台的资源查询：

```javascript
const newPlatformQuery = `
  SELECT 
    id,
    account_name,
    resource_type,
    resource_name,
    expired_time,
    differ_days
  FROM your_resource_table
  WHERE id IN (
    SELECT MAX(id)
    FROM your_resource_table
    GROUP BY resource_id
  )
  AND differ_days <= ?
  ORDER BY differ_days ASC;
`
```

2. 添加新平台的账单查询：

```javascript
const newPlatformBalanceQuery = `
  SELECT 
    id,
    account_name,
    balance,
    updated_at
  FROM your_balance_table
  WHERE id IN (
    SELECT MAX(id)
    FROM your_balance_table
    GROUP BY account_name
  );
`
```

### 4. 更新前端组件

1. 在 `frontend/src/components/PlatformIcon.vue` 中添加图标支持：

```typescript
import { NewPlatformIcon } from 'your-icon-library'

const iconComponent = computed(() => {
  switch (props.platform) {
    case CloudPlatform.NEW_PLATFORM:
      return NewPlatformIcon
    // ... 其他平台
  }
})
```

2. 在 `frontend/src/views/ResourceList.vue` 中添加平台配置：

```typescript
const platforms: PlatformConfig[] = [
  // ... 现有平台
  { 
    label: '新平台', 
    value: CloudPlatform.NEW_PLATFORM,
    icon: 'new-platform'
  }
]
```

## 注意事项

1. 数据格式统一
   - 确保新平台的数据格式与现有格式保持一致
   - 统一字段名称和数据类型

2. 错误处理
   - 添加适当的错误处理和日志记录
   - 确保在平台不可用时有合适的降级处理

3. 性能考虑
   - 确保查询语句已优化
   - 添加适当的索引
   - 考虑数据量大时的性能影响

4. 安全性
   - 所有配置信息使用环境变量
   - 避免在代码中硬编码敏感信息
   - 使用参数化查询防止 SQL 注入

## 测试清单

- [ ] 数据库连接测试
- [ ] 资源查询测试
- [ ] 账单查询测试
- [ ] 前端显示测试
- [ ] 筛选功能测试
- [ ] 错误处理测试 