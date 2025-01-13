# 云资源监控看板后端

基于 Node.js + Express + MySQL 的云资源监控系统后端服务。

## 功能特性

- 多数据源支持
  * 腾讯云数据库
  * 华为云数据库

- 资源监控
  * 资源到期时间查询
  * 账户余额查询
  * 费用账单统计

- 数据处理
  * 自动计算剩余天数
  * 数据去重处理
  * 多维度数据聚合

## 技术栈

- Node.js
- Express
- MySQL
- Sequelize
- TypeScript

## 快速开始

### 环境要求

- Node.js >= 16
- MySQL >= 5.7
- npm >= 8

### 安装依赖

```bash
npm install
```

### 开发环境运行

```bash
npm run dev
```

### 生产环境运行

```bash
npm run start
```

## 项目配置

### 环境变量

在项目根目录创建 `.env` 文件：

```env
# 腾讯云数据库配置
TENCENT_DB_HOST=your_tencent_db_host
TENCENT_DB_PORT=3306
TENCENT_DB_USER=your_username
TENCENT_DB_PASSWORD=your_password
TENCENT_DB_NAME=tencent_cloud_monitor

# 华为云数据库配置
HUAWEI_DB_HOST=your_huawei_db_host
HUAWEI_DB_PORT=3306
HUAWEI_DB_USER=your_username
HUAWEI_DB_PASSWORD=your_password
HUAWEI_DB_NAME=huaweicloud_monitor

# 服务器配置
PORT=3000
HOST=localhost

# 跨域配置
CORS_ORIGIN=http://localhost:5173
```

## API 文档

### 资源列表
GET `/api/resources`
- 查询参数：
  * warningDays: 预警天数（默认30天）
- 返回数据：
  * 资源到期信息列表

### 账单信息
GET `/api/billing`
- 返回数据：
  * 账户余额信息
  * 费用账单明细

## 数据库表结构

### 腾讯云数据库
- billing_info: 账单信息表
- cvm_instances: 云服务器实例表
- cbs_disks: 云硬盘表
- domains: 域名表
- lighthouse_instances: 轻量服务器表
- ssl_certificates: SSL证书表

### 华为云数据库
- resources: 资源信息表
- account_balances: 账户余额表

## 开发指南

### 代码规范
- 使用 ESLint 规范代码
- 使用 Prettier 格式化代码
- 遵循 RESTful API 设计规范

### 安全注意事项
- 所有配置信息使用环境变量
- 生产环境隐藏错误详情
- 定期更新依赖包
- 使用参数化查询防止 SQL 注入 