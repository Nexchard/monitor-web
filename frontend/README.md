# 云资源监控平台前端

## 项目简介
本项目是云资源监控平台的前端部分，基于 Vue 3 + TypeScript + Element Plus 开发。提供了直观的界面来展示和管理云资源的监控数据，包括资源到期情况、账户余额和账单详情等功能。

## 主要功能
1. 资源到期监控
   - 展示各云平台资源的到期时间
   - 支持按剩余天数筛选和排序
   - 提供多维度筛选（平台、账号、资源类型）
   - 支持资源备注管理

2. 账户余额监控
   - 显示各账户的现金余额
   - 展示储值卡余额及到期时间
   - 支持按平台筛选

3. 账单明细查看
   - 展示各账户的消费明细
   - 按项目和服务类型分类
   - 支持按平台筛选

4. 数据同步功能
   - 支持手动触发数据同步
   - 自动定时同步（可配置间隔时间）

## 技术栈
- Vue 3
- TypeScript
- Element Plus
- Vite
- Vue Router
- Axios
- dayjs

## 开发环境要求
- Node.js >= 16.0.0
- npm >= 7.0.0

## 安装和运行
1. 安装依赖
```bash
npm install
```

2. 配置环境变量
```bash
# 复制环境变量示例文件
cp .env.example .env

# 修改环境变量
# 编辑 .env 文件，配置必要的环境变量
```

3. 开发环境运行
```bash
npm run dev
```

4. 生产环境构建
```bash
npm run build
```

## 环境变量说明
```env
# API 基础路径
VITE_API_URL=http://localhost:3000/api

# 默认预警天数
VITE_APP_DEFAULT_WARNING_DAYS=30

# 数据轮询间隔（毫秒）
VITE_APP_POLLING_INTERVAL=30000
```

## 项目结构
```
frontend/
├── src/
│   ├── api/          # API 接口定义
│   ├── components/   # 公共组件
│   ├── types/        # TypeScript 类型定义
│   ├── views/        # 页面组件
│   ├── router/       # 路由配置
│   ├── App.vue       # 根组件
│   └── main.ts       # 入口文件
├── public/           # 静态资源
├── .env.example      # 环境变量示例
├── index.html        # HTML 模板
├── tsconfig.json     # TypeScript 配置
├── vite.config.ts    # Vite 配置
└── package.json      # 项目配置和依赖
```

## 开发指南

### 代码规范
- 使用 TypeScript 编写代码
- 遵循 Vue 3 组合式 API 风格
- 使用 Element Plus 组件库的设计规范

### 组件开发规范
1. 组件文件命名采用 PascalCase
2. 组件属性和方法采用 camelCase
3. 类型定义放在 types 目录下
4. API 接口统一管理在 api 目录下

### 样式开发规范
1. 使用 scoped CSS
2. 遵循 BEM 命名规范
3. 优先使用 Element Plus 的变量系统
4. 响应式设计断点统一管理

### Git 提交规范
```
feat: 新功能
fix: 修复问题
docs: 文档修改
style: 代码格式修改
refactor: 代码重构
test: 测试用例修改
chore: 其他修改
```

## 部署说明
1. 构建生产环境代码
```bash
npm run build
```

2. 部署 dist 目录内容到 Web 服务器

3. 配置 Web 服务器
```nginx
# Nginx 配置示例
location / {
    root /path/to/dist;
    try_files $uri $uri/ /index.html;
}
```

## 常见问题
1. 开发环境跨域问题
   - 检查 VITE_API_URL 配置
   - 确认后端 CORS 配置正确

2. 构建失败
   - 检查 Node.js 版本
   - 清除 node_modules 重新安装

3. 页面加载慢
   - 检查网络请求
   - 确认数据轮询间隔是否合理

## 更新日志
### v1.0.0 (2024-02-11)
- 初始版本发布
- 实现基础监控功能
- 支持资源备注
- 添加数据同步功能

## 维护者
- 开发团队

## 许可证
MIT License
