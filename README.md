# 云资源监控统一管理平台

## 项目简介
本项目是一个统一的云资源监控管理平台，用于整合华为云和腾讯云的资源监控数据，提供统一的数据展示和查询界面。

## 系统架构
- 前端：Vue 3 + Element Plus
- 后端：Node.js + Express
- 数据库：MySQL

## 主要功能
1. 数据同步
   - 从华为云监控数据库同步数据
   - 从腾讯云监控数据库同步数据
   - 数据统一存储到新数据库

2. 数据展示
   - 资源使用概览
     * 各云服务商资源数量统计
     * 资源类型分布
     * 账户余额概览
   - 账单信息展示
     * 各账户消费统计
     * 按项目消费分布
     * 按服务类型消费分布
   - 资源详情列表
     * 计算资源（CVM/ECS）
     * 存储资源（CBS/云硬盘）
     * 域名资源
     * SSL证书
     * 其他云服务资源

3. 查询功能
   - 按云服务商筛选（华为云/腾讯云）
   - 按资源类型筛选
   - 按时间范围筛选
   - 按项目筛选
   - 按区域筛选
   - 按到期时间筛选

## 数据库设计
### 统一数据库表结构

1. cloud_accounts (云账户表)
   - id
   - account_name
   - cloud_provider (hw/tencent)
   - balance
   - currency
   - created_at
   - updated_at

2. cloud_resources (统一资源表)
   - id
   - account_name
   - cloud_provider
   - resource_type (cvm/cbs/domain/ssl等)
   - resource_id
   - resource_name
   - project_name
   - region
   - zone
   - expire_time
   - remaining_days
   - status
   - created_at
   - updated_at

3. cloud_bills (统一账单表)
   - id
   - account_name
   - cloud_provider
   - project_name
   - service_type
   - region
   - amount
   - currency
   - billing_cycle
   - billing_date
   - created_at
   - updated_at

## 项目结构 