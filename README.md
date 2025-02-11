# 云资源监控统一管理平台

## 项目简介
本项目是一个统一的云资源监控管理平台，用于整合华为云和腾讯云的资源监控数据，提供统一的数据展示和查询界面。主要功能包括资源到期监控、账户余额监控、账单分析等。

## 系统架构
### 前端技术栈
- Vue 3 + TypeScript
- Element Plus UI 框架
- Vite 构建工具
- Vue Router 路由管理
- Axios 请求库

### 后端技术栈
- Node.js + Express
- TypeScript
- MySQL 数据库
- 定时任务调度

### 数据库架构
- 统一数据库：cloud_monitor
- 华为云数据库：huaweicloud_monitor
- 腾讯云数据库：tencent_cloud_monitor

## 主要功能
### 1. 资源监控
- 多云平台资源统一管理
- 资源到期时间监控
- 自定义预警天数
- 资源备注功能
- 多维度数据筛选

### 2. 账户管理
- 账户余额实时监控
- 储值卡管理
- 余额预警提醒
- 账户分类管理

### 3. 账单分析
- 多维度账单查询
- 费用趋势分析
- 项目成本统计
- 服务类型消费分布

### 4. 数据同步
- 自动定时同步
- 手动触发同步
- 同步日志记录
- 数据验证机制

## 快速开始

### 环境要求
- Node.js >= 16.0.0
- MySQL >= 8.0
- npm >= 7.0.0

### 安装步骤

1. 克隆项目
```bash
git clone [项目地址]
cd monitor-web2
```

2. 安装后端依赖
```bash
cd backend
npm install
```

3. 安装前端依赖
```bash
cd ../frontend
npm install
```

4. 配置环境变量
```bash
# 后端配置
cd backend
cp .env.example .env
# 编辑 .env 文件，配置数据库连接等信息

# 前端配置
cd ../frontend
cp .env.example .env
# 编辑 .env 文件，配置API地址等信息
```

5. 初始化数据库
```bash
cd backend
npm run db:init
```

6. 启动服务
```bash
# 启动后端服务
cd backend
npm run dev

# 启动前端服务
cd frontend
npm run dev
```

## 项目结构
```
monitor-web2/
├── frontend/          # 前端项目
│   ├── src/          # 源代码
│   ├── public/       # 静态资源
│   └── README.md     # 前端说明文档
│
├── backend/          # 后端项目
│   ├── src/         # 源代码
│   ├── tests/       # 测试文件
│   └── README.md    # 后端说明文档
│
└── README.md        # 项目说明文档
```

## 开发指南

### 代码规范
- 使用 TypeScript 编写代码
- 遵循 ESLint 规范
- 使用 Prettier 格式化代码
- 遵循 Git 提交规范

### 分支管理
- main: 主分支，用于生产环境
- develop: 开发分支
- feature/*: 功能分支
- hotfix/*: 紧急修复分支

### 部署流程
1. 构建前端
```bash
cd frontend
npm run build
```

2. 构建后端
```bash
cd backend
npm run build
```

3. 部署说明
- 前端部署到 Web 服务器
- 后端部署到应用服务器
- 配置反向代理
- 启动服务

## 监控指标

### 资源监控
- 资源到期时间
- 剩余天数预警
- 资源使用状态
- 资源类型分布

### 账户监控
- 账户余额
- 储值卡余额
- 储值卡到期时间
- 余额变动趋势

### 账单监控
- 月度费用统计
- 项目费用分布
- 服务类型费用
- 费用趋势分析

## 常见问题
1. 数据同步问题
   - 检查数据库连接配置
   - 确认同步任务是否正常运行
   - 查看同步日志

2. 余额显示异常
   - 验证数据同步时间
   - 检查余额计算逻辑
   - 确认汇率换算准确性

3. 资源预警设置
   - 调整预警天数阈值
   - 检查预警规则配置
   - 确认通知机制正常

## 更新日志
### v1.0.0 (2024-02-11)
- 初始版本发布
- 支持华为云和腾讯云资源监控
- 实现基本的数据同步和展示功能
- 添加资源备注功能
- 支持账户余额监控

## 维护者
- 开发团队

## 许可证
MIT License 