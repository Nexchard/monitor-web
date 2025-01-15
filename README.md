# 云资源监控看板

一个基于 Vue 3 + Node.js 的多云平台资源监控系统，支持腾讯云和华为云的资源到期提醒、账户余额监控和费用账单统计。

## 系统功能

### 资源到期监控
- 多云平台资源统一管理
- 自定义预警天数设置
- 多级预警状态显示
- 支持多维度筛选

### 账户余额监控
- 实时余额展示
- 多账号余额汇总
- 低余额预警提示

### 费用账单统计
- 按项目统计费用
- 按服务类型统计
- 费用趋势分析

## 项目结构

```
├── frontend/           # 前端项目
│   ├── src/           # 源代码
│   ├── public/        # 静态资源
│   └── README.md      # 前端说明文档
│
├── backend/           # 后端项目
│   ├── src/          # 源代码
│   ├── config/       # 配置文件
│   └── README.md     # 后端说明文档
│
└── README.md         # 项目说明文档
```

## 快速开始

### 环境要求

- Node.js >= 16
- MySQL >= 5.7
- npm >= 8

### 项目启动

在项目根目录下运行以下命令来同时启动前端和后端：

```bash
npm install
npm run start
```

### 配置环境变量

在项目根目录创建 `.env` 文件：

```env
# API 配置
VITE_API_URL=http://localhost:3000/api

# 应用基础配置
VITE_APP_TITLE=云资源管理系统
VITE_APP_DEFAULT_WARNING_DAYS=65
VITE_APP_PAGE_SIZE=10

# 显示格式配置
VITE_APP_DATE_FORMAT=YYYY-MM-DD HH:mm:ss
VITE_APP_CURRENCY_SYMBOL=¥

# 功能配置
VITE_APP_POLLING_INTERVAL=30000  # 数据刷新间隔(毫秒)
```

## 技术栈

### 前端
- Vue 3
- TypeScript
- Element Plus
- Vite
- Vue Router
- Axios
- Day.js

### 后端
- Node.js
- Express
- MySQL
- Sequelize

## 配置说明

### 前端配置
详见 [frontend/README.md](./frontend/README.md)

### 后端配置
详见 [backend/README.md](./backend/README.md)

## 预警规则

资源到期预警规则：
- 红色预警：剩余天数 ≤ 15天
- 黄色预警：剩余天数 16-30天
- 蓝色提醒：剩余天数 31-65天
- 正常状态：剩余天数 > 65天

账户余额预警规则：
- 红色预警：余额 ≤ 100元
- 黄色预警：余额 101-500元
- 蓝色提醒：余额 501-1000元
- 正常状态：余额 > 1000元

## 开发指南

### 代码规范
- 使用 ESLint 和 Prettier 规范代码
- 遵循 TypeScript 开发规范
- 遵循 Vue 3 组件开发规范
- 遵循 RESTful API 设计规范

### Git 提交规范
- feat: 新功能
- fix: 修复问题
- docs: 文档修改
- style: 代码格式
- refactor: 代码重构
- test: 测试相关
- chore: 构建过程或辅助工具的变动

## 安全注意事项
- 所有敏感配置使用环境变量
- 生产环境隐藏错误详情
- 定期更新依赖包
- 使用参数化查询防止 SQL 注入
- 请勿在代码中硬编码敏感信息

## 许可证

MIT License 