# 云资源监控看板前端

基于 Vue 3 + TypeScript + Element Plus 的云资源监控系统前端项目。

## 功能特性

- 多云平台资源监控
  * 腾讯云资源到期提醒
  * 华为云资源到期提醒
  * 账户余额监控
  * 费用账单统计

- 灵活的筛选功能
  * 按平台筛选
  * 按账号筛选
  * 按资源类型筛选
  * 资源名称搜索

- 自动化功能
  * 自动刷新数据
  * 页面切换自动暂停/恢复
  * 本地存储预警设置

## 技术栈

- Vue 3
- TypeScript
- Vite
- Element Plus
- Vue Router
- Vue Icons Plus
- Axios
- Day.js

## 快速开始

### 环境要求

- Node.js >= 16
- npm >= 8

### 安装依赖

```bash
npm install
```

### 开发环境运行

```bash
npm run dev
```

### 生产环境构建

```bash
npm run build
```

## 项目配置

### 环境变量

在项目根目录创建 `.env` 文件：

```env
# API 配置
VITE_API_URL=http://localhost:3000/api

# 应用基础配置
VITE_APP_TITLE=云资源管理系统
VITE_APP_DEFAULT_WARNING_DAYS=30
VITE_APP_PAGE_SIZE=10

# 显示格式配置
VITE_APP_DATE_FORMAT=YYYY-MM-DD HH:mm:ss
VITE_APP_CURRENCY_SYMBOL=¥

# 功能配置
VITE_APP_POLLING_INTERVAL=30000  # 数据刷新间隔(毫秒)
```

## 项目结构

```
frontend/
├── src/
│   ├── api/          # API 请求
│   ├── components/   # 公共组件
│   ├── router/       # 路由配置
│   ├── types/        # TypeScript 类型
│   ├── utils/        # 工具函数
│   └── views/        # 页面组件
├── public/           # 静态资源
└── index.html        # 入口文件
```

## 开发指南

### 代码规范
- 使用 TypeScript 编写代码
- 使用 Composition API
- 组件名使用 PascalCase
- 变量名使用 camelCase

### Git 提交规范
- feat: 新功能
- fix: 修复问题
- docs: 文档修改
- style: 代码格式
- refactor: 代码重构
- test: 测试相关
- chore: 构建过程或辅助工具的变动

### 账户余额监控
- 实时余额展示
- 多账号余额汇总
- 现金余额展示
- 储值卡余额展示
- 储值卡到期提醒

## 显示规则

### 余额类型显示
- 现金余额：显示"现金余额"
- 储值卡：显示"储值卡 (到期时间)"
