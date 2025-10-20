# 🛠️ 开发指南

## 📋 项目维护说明

### 🗂️ 项目结构详解

```
LabPage/
├── .gitignore              # Git忽略文件配置
├── README.md               # 项目说明文档
├── DEVELOPMENT.md          # 开发指南（本文件）
├── package.json            # 根目录包配置
├── start.sh / start.bat    # 启动脚本
├── 
├── backend/                # 后端API服务
│   ├── config.example.js   # 配置文件模板
│   ├── config.js          # 实际配置文件（已忽略）
│   ├── server.js          # 服务器入口文件
│   ├── database/          # 数据库相关
│   │   └── connection.js  # 数据库连接配置
│   ├── middleware/        # 中间件
│   │   └── auth.js        # 认证中间件
│   ├── routes/            # API路由
│   │   ├── auth.js        # 认证相关API
│   │   ├── news.js        # 新闻管理API
│   │   ├── members.js     # 成员管理API
│   │   ├── projects.js    # 项目管理API
│   │   └── public.js      # 公共API
│   └── uploads/           # 文件上传目录
│
├── frontend/              # 前端展示页面
│   ├── src/
│   │   ├── components/    # 通用组件
│   │   │   ├── common/    # 公共组件
│   │   │   └── home/      # 首页组件
│   │   ├── views/         # 页面组件
│   │   ├── stores/        # Pinia状态管理
│   │   ├── utils/         # 工具函数
│   │   └── assets/        # 静态资源
│   └── vite.config.js     # Vite配置
│
├── admin/                 # 管理员后台
│   ├── src/
│   │   ├── layout/        # 布局组件
│   │   ├── views/         # 管理页面
│   │   ├── components/    # 管理组件
│   │   ├── stores/        # 状态管理
│   │   └── utils/         # 工具函数
│   └── vite.config.js     # Vite配置
│
└── database/              # 数据库脚本
    └── schema.sql         # 数据库结构
```

## 🔧 开发环境配置

### 1. 环境要求
- Node.js 16.0+
- MySQL 8.0+
- Git

### 2. 克隆项目后的初始化步骤

```bash
# 1. 安装依赖
npm run install-all

# 2. 配置环境变量
cp backend/.env.example backend/.env
# 编辑 backend/.env，修改数据库密码和JWT密钥

# 3. 初始化数据库
mysql -u root -p < database/schema.sql

# 4. 启动服务
./start.sh  # Mac/Linux
# 或
start.bat   # Windows
```

## 📝 常用开发任务

### 🚀 启动开发服务器

```bash
# 方式1: 使用启动脚本（推荐）
./start.sh

# 方式2: 分别启动各服务
cd backend && npm run dev    # 后端服务
cd frontend && npm run dev   # 前端服务
cd admin && npm run dev      # 管理端服务
```

### 🗄️ 数据库操作

```bash
# 重新初始化数据库
mysql -u root -p < database/schema.sql

# 备份数据库
mysqldump -u root -p lab_website > backup_$(date +%Y%m%d_%H%M%S).sql

# 查看数据库状态
mysql -u root -p -e "USE lab_website; SHOW TABLES;"
```

### 📦 依赖管理

```bash
# 安装新依赖
cd backend && npm install package-name
cd frontend && npm install package-name
cd admin && npm install package-name

# 更新依赖
npm update

# 清理依赖
rm -rf */node_modules */package-lock.json
npm run install-all
```

### 🏗️ 构建项目

```bash
# 构建前端和管理端
npm run build

# 分别构建
cd frontend && npm run build
cd admin && npm run build
```

## 🔐 安全配置

### 1. 环境变量配置安全
- ✅ `backend/.env` 已添加到 `.gitignore`
- ✅ 提供了 `.env.example` 作为模板
- ✅ 使用 dotenv 包管理环境变量
- 🔒 敏感信息（数据库密码、JWT密钥）存储在 `.env` 中

### 2. JWT密钥
- ✅ 在 `backend/.env` 中配置 `JWT_SECRET`
- 🔒 生产环境使用强随机密钥（建议32位以上）

### 3. 文件上传安全
- ✅ 已配置文件类型限制
- ✅ 已配置文件大小限制
- ✅ 上传文件目录已添加到 `.gitignore`

## 📁 文件说明

### 🔒 敏感文件（已忽略）
- `backend/.env` - 环境变量（数据库密码、JWT密钥等）
- `*/node_modules/` - 依赖包
- `backend/uploads/*` - 用户上传文件

### 📋 配置文件
- `backend/.env.example` - 环境变量模板
- `backend/config.js` - 配置加载文件（从环境变量读取）
- `*/package.json` - 项目依赖配置
- `*/vite.config.js` - 前端构建配置

### 🗃️ 数据库相关
- `database/schema.sql` - 数据库结构和初始数据
- `backend/uploads/.gitkeep` - 保持上传目录结构

## 🐛 常见问题

### 1. 端口占用
```bash
# 查看端口占用
lsof -i :3000
lsof -i :3001
lsof -i :8000

# 杀死占用进程
kill -9 PID
```

### 2. 数据库连接失败
- 检查MySQL服务是否启动
- 检查 `backend/.env` 中的数据库配置
- 确认数据库 `lab_website` 已创建
- 确认 `.env` 文件中的密码正确

### 3. 依赖安装失败
```bash
# 清理缓存
npm cache clean --force

# 删除node_modules重新安装
rm -rf */node_modules */package-lock.json
npm run install-all
```

### 4. 权限问题
```bash
# 给启动脚本执行权限
chmod +x start.sh

# 检查文件权限
ls -la backend/uploads/
```

## 🚀 部署建议

### 1. 生产环境配置
- 使用PM2管理Node.js进程
- 配置Nginx反向代理
- 启用SSL证书
- 配置数据库备份

### 2. 环境变量
在生产环境中，请在 `backend/.env` 中配置：
```bash
NODE_ENV=production
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=lab_website
DB_USER=lab_user
DB_PASSWORD=secure_password
JWT_SECRET=your_secure_random_jwt_secret_min_32_chars
SERVER_PORT=5080
```

### 3. 构建部署
```bash
# 构建前端资源
npm run build

# 启动生产服务
cd backend && npm start
```

## 📖 API文档

### 🔐 认证相关
- `POST /api/auth/login` - 管理员登录
- `GET /api/auth/me` - 获取当前用户信息
- `POST /api/auth/logout` - 登出

### 📰 内容管理
- `GET /api/news` - 获取新闻列表
- `POST /api/news` - 创建新闻（需认证）
- `PUT /api/news/:id` - 更新新闻（需认证）
- `DELETE /api/news/:id` - 删除新闻（需认证）

### 👥 成员管理
- `GET /api/members` - 获取成员列表
- `POST /api/members` - 添加成员（需认证）
- `PUT /api/members/:id` - 更新成员（需认证）
- `DELETE /api/members/:id` - 删除成员（需认证）

### 🔬 项目管理
- `GET /api/projects` - 获取项目列表
- `POST /api/projects` - 创建项目（需认证）
- `PUT /api/projects/:id` - 更新项目（需认证）
- `DELETE /api/projects/:id` - 删除项目（需认证）

### 🌐 公共接口
- `GET /api/public/lab-info` - 获取实验室信息
- `GET /api/public/research-areas` - 获取研究方向
- `GET /api/public/site-config` - 获取网站配置
- `GET /api/public/publications` - 获取论文列表

## 🎨 前端开发

### 组件开发规范
- 使用 Vue 3 Composition API
- 组件名使用 PascalCase
- 文件名使用 PascalCase
- 样式使用 scoped

### 状态管理
- 使用 Pinia 进行状态管理
- 按功能模块划分 store
- 异步操作统一处理错误

### 路由配置
- 使用 Vue Router 4
- 路由懒加载
- 路由守卫处理认证

## 🔧 后端开发

### API开发规范
- RESTful API设计
- 统一的响应格式
- 完整的错误处理
- 输入验证

### 数据库操作
- 使用连接池
- 参数化查询防止SQL注入
- 事务处理

### 文件上传
- 类型限制
- 大小限制
- 安全检查

## 📊 版本管理

### Git工作流
```bash
# 创建功能分支
git checkout -b feature/new-feature

# 提交更改
git add .
git commit -m "feat: 添加新功能"

# 合并到主分支
git checkout main
git merge feature/new-feature
```

### 提交信息规范
- `feat:` 新功能
- `fix:` 修复bug
- `docs:` 文档更新
- `style:` 代码格式
- `refactor:` 重构
- `test:` 测试
- `chore:` 构建/工具

## 📞 技术支持

如有问题，请：
1. 查看本文档
2. 检查控制台日志
3. 查看项目README
4. 提交Issue
