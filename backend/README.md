# 云资源监控系统后端

## 项目简介
本系统是一个多云资源监控平台，用于统一管理和监控华为云和腾讯云的资源使用情况。主要功能包括：
- 资源到期监控
- 账户余额监控
- 账单明细查询

## 技术栈
- Node.js
- TypeScript
- Express
- MySQL
- node-cron

## 项目结构
backend/
├── src/
│ ├── config/                # 数据库配置
│ ├── controllers/           # 控制器
│ ├── db/                    # 数据库初始化脚本
│ ├── routes/                # API 路由
│ ├── services/              # 业务逻辑
│ ├── tasks/                 # 定时同步任务
│ └── app.ts                 # 应用入口
├── .env                     # 环境变量
├── package.json             # 项目依赖
└── tsconfig.json            # TypeScript 配置

## API 接口

### 资源到期信息
```http
GET /api/resources/expiry
```
查询参数：
- days: 剩余天数阈值（默认65天）
- order: 排序方式（asc/desc）

### 账户余额
```http
GET /api/accounts/balances
```
返回所有云账户的余额信息，包括现金余额和储值卡。

### 账单明细
```http
GET /api/bills/details
```
返回所有云账单明细。

## 项目部署

### 环境变量配置
在 `.env` 文件中配置以下内容：
```bash
# 华为云数据库配置
HUAWEI_DB_HOST=localhost
HUAWEI_DB_USER=root
HUAWEI_DB_PASSWORD=your_password
HUAWEI_DB_PORT=3306
HUAWEI_DB_DATABASE=huaweicloud_monitor

# 腾讯云数据库配置
TENCENT_DB_HOST=localhost
TENCENT_DB_USER=root
TENCENT_DB_PASSWORD=your_password
TENCENT_DB_PORT=3306
TENCENT_DB_DATABASE=tencent_cloud_monitor

# 统一数据库配置
UNIFIED_DB_HOST=localhost
UNIFIED_DB_USER=root
UNIFIED_DB_PASSWORD=your_password
UNIFIED_DB_PORT=3306
UNIFIED_DB_DATABASE=cloud_monitor

# 应用配置
HOST=0.0.0.0  # 监听所有网卡
PORT=3000     # 监听端口

# CORS配置
CORS_ORIGINS=http://域名1:端口,http://域名2:端口
```

### 安装和启动
1. 安装依赖：
```bash
npm install
```

2. 初始化数据库：
```bash
npm run init-db
```

3. 启动服务：
```bash
# 开发环境
npm run dev

# 生产环境
npm run build
npm start
```

## 数据处理

### 数据验证
系统在同步数据时进行以下验证：
- 必填字段检查
- 日期格式验证
- 重复数据检查
- 数据一致性验证

### 错误处理
系统通过 sync_logs 表记录所有同步操作：
- 同步类型
- 开始/结束时间
- 成功/失败状态
- 错误信息
- 批次号

## 注意事项
- 确保数据库使用 utf8mb4 字符集以支持中文
- 定时任务默认每小时执行一次
- 建议定期清理历史同步日志

## 多网卡部署说明

1. 配置后端
- 在 `.env` 文件中设置监听地址和端口：
```bash
HOST=0.0.0.0  # 监听所有网卡
PORT=3000     # 监听端口
```

2. 配置前端
- 在 `.env` 文件中设置API地址：
```bash
VITE_API_BASE_URL=http://实际服务器IP:3000
```

3. CORS配置
- 在后端 `.env` 文件中配置允许的前端域名：
```bash
CORS_ORIGINS=http://域名1:端口,http://域名2:端口
```

4. 网络配置
- 确保服务器防火墙允许相应端口访问
- 如果使用云服务器，需要在安全组中开放相应端口
