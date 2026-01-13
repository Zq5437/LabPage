# 实验室网站项目

## 项目简介
这是一个现代化的实验室网站，包含前端展示页面和后台管理系统。采用前后端分离架构，支持响应式设计，具备完整的内容管理功能。

## ✨ 功能特性
- 🏠 **实验室主页展示** - 精美的首页设计，展示实验室形象
- 👥 **成员管理** - 完整的成员信息管理，支持分类展示
- 📰 **新闻动态** - 新闻发布、分类、置顶等功能
- 🔬 **研究项目** - 项目展示、文件管理、状态跟踪
- 📄 **发表论文** - 论文管理、分类检索
- 🎯 **研究方向** - 研究领域展示
- 🎓 **招生信息** - 招生公告管理
- 🔧 **设备资源** - 实验设备管理
- 🔐 **管理员后台** - 功能完善的后台管理系统
- 📊 **数据统计** - 访问统计、数据分析
- 📱 **响应式设计** - 完美适配各种设备
- 🌐 **静态网站导出** - 一键导出为静态网站，支持部署到 GitHub Pages

## 🛠️ 技术栈
- **后端**: Node.js + Express + MySQL
- **前端**: Vue.js 3 + Vite + Pinia
- **管理端**: Vue.js 3 + Element Plus
- **数据库**: MySQL 8.0+
- **认证**: JWT Token
- **文件上传**: Multer
- **API文档**: RESTful API

## 📁 项目结构
```
LabPage/
├── backend/              # 后端API服务
│   ├── routes/          # API路由
│   ├── middleware/      # 中间件
│   ├── database/        # 数据库连接
│   ├── uploads/         # 文件上传目录
│   └── server.js        # 服务入口
├── frontend/            # 前端展示页面
│   ├── src/
│   │   ├── views/       # 页面组件
│   │   ├── components/  # 通用组件
│   │   ├── stores/      # 状态管理
│   │   └── utils/       # 工具函数
│   └── package.json
├── admin/               # 管理员后台
│   ├── src/
│   │   ├── views/       # 管理页面
│   │   ├── layout/      # 布局组件
│   │   ├── stores/      # 状态管理
│   │   └── utils/       # 工具函数
│   └── package.json
├── database/            # 数据库脚本
│   └── schema.sql       # 数据库结构
├── start.sh             # Linux/Mac 启动脚本
├── start.bat            # Windows 启动脚本
└── README.md
```

## 🚀 快速开始

### 方法一：使用启动脚本（推荐）

#### Linux/Mac系统：
```bash
# 给脚本执行权限
chmod +x start.sh

# 运行启动脚本
./start.sh
```

#### Windows系统：
```batch
# 直接双击运行或在命令行执行
start.bat
```

### 方法二：手动启动

#### 1. 环境要求
- Node.js 16.0+
- MySQL 8.0+
- npm 或 yarn

#### 2. 安装依赖
```bash
# 安装所有依赖
npm run install-all

# 或分别安装
cd backend && npm install
cd ../frontend && npm install  
cd ../admin && npm install
```

#### 3. 环境变量配置
```bash
# 复制环境变量模板文件
cp backend/.env.example backend/.env

# 编辑 backend/.env 文件，修改数据库密码等配置
# 主要需要修改：
# - DB_PASSWORD: 你的MySQL密码
# - JWT_SECRET: JWT密钥（建议使用随机字符串）
```

#### 4. 数据库初始化
```bash
# 1. 启动MySQL服务
# 2. 创建数据库并导入结构
mysql -u root -p < database/schema.sql
```

#### 5. 启动服务
```bash
# 启动后端服务 (端口: 5080)
cd backend && npm run dev

# 启动前端服务 (端口: 5173)
cd frontend && npm run dev

# 启动管理端服务 (端口: 5174)
cd admin && npm run dev
```

## 🌐 访问地址
- **前端网站**: http://localhost:5173
- **管理后台**: http://localhost:5174
- **后端API**: http://localhost:5080

## 👤 默认账号
- **用户名**: admin
- **密码**: admin123

## 📋 环境变量配置
创建 `backend/.env` 文件并配置以下环境变量：
```bash
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=lab_website
DB_USER=root
DB_PASSWORD=你的MySQL密码  # 修改为你的实际密码

# JWT配置
JWT_SECRET=你的JWT密钥  # 建议使用长随机字符串

# 服务器端口
SERVER_PORT=5080
```

**注意：** `.env` 文件已在 `.gitignore` 中配置，不会被提交到Git仓库

## 🔧 开发说明

### 后端API
- 基于Express框架
- JWT认证机制
- 支持文件上传
- 完整的错误处理
- API文档规范

### 前端页面
- Vue 3 + Composition API
- Vite构建工具
- Pinia状态管理
- 响应式设计
- 现代化UI设计

### 管理后台
- Element Plus UI组件
- 完整的CRUD操作
- 数据统计图表
- 权限管理
- 文件管理

## 📝 主要功能模块

### 1. 内容管理
- **新闻管理**: 发布、编辑、删除新闻，支持富文本编辑
- **成员管理**: 添加实验室成员，分类管理（教师、学生等）
- **项目管理**: 研究项目展示，支持文件附件
- **论文管理**: 发表论文记录，支持分类和搜索

### 2. 信息展示
- **实验室介绍**: 实验室基本信息展示
- **研究方向**: 主要研究领域介绍
- **招生信息**: 研究生招生公告
- **设备资源**: 实验室设备展示

### 3. 系统管理
- **用户认证**: 管理员登录系统
- **权限控制**: 不同级别管理员权限
- **数据统计**: 访问量统计、内容统计
- **系统配置**: 网站基本配置管理

## 🎨 界面预览
- 现代化的设计风格
- 响应式布局适配
- 流畅的用户体验
- 直观的管理界面

## 🔒 安全特性
- JWT Token认证
- 密码加密存储
- 文件上传安全检查
- SQL注入防护
- XSS攻击防护

## 📱 响应式支持
- 桌面端优化显示
- 平板适配
- 移动端友好
- 触控操作支持

## 🚀 部署建议
- 使用PM2管理Node.js进程
- Nginx反向代理
- SSL证书配置
- 定期数据库备份

## 📚 文档导航

本项目提供完整的文档支持，帮助你快速上手和深入使用：

### 核心文档

- 📖 **[README.md](./README.md)** - 项目概览和快速开始（当前文档）
- 🚀 **[DEPLOYMENT.md](./DEPLOYMENT.md)** - 完整的部署指南（推荐阅读）
  - 快速部署（5分钟上线）
  - 详细步骤
  - Cpolar 内网穿透配置
  - 常见问题解决

### 开发相关

- 🛠️ **[DEVELOPMENT.md](./DEVELOPMENT.md)** - 开发指南和项目结构说明
- 📝 **[CHANGELOG.md](./CHANGELOG.md)** - 版本更新记录
- 🔄 **[UPGRADE_GUIDE.md](./UPGRADE_GUIDE.md)** - 升级指南

### 静态部署

- 📦 **[STATIC_EXPORT.md](./STATIC_EXPORT.md)** - 静态网站导出完整指南
  - 导出方式和命令
  - 工作原理
  - 部署到多个平台
  
- 🌐 **[GITHUB_PAGES.md](./GITHUB_PAGES.md)** - GitHub Pages 部署专项指南
  - 用户网站 vs 项目网站
  - SPA 路由解决方案
  - 完整检查清单

## 🌐 静态网站导出

本项目支持将动态网站一键导出为静态版本，可部署到 GitHub Pages、Netlify、Vercel 等静态托管服务。

### 快速导出

```bash
# 项目网站（推荐）- 需要指定 GitHub 仓库名
npm run build:static:project 你的仓库名
# 例如：npm run build:static:project lab-website

# 用户网站（仓库名必须是 username.github.io）
npm run build:static:user
```

**⚠️ 重要说明：**
- **项目网站**：命令后面必须加上你的 GitHub 仓库名称
- **用户网站**：仓库名必须是 `username.github.io` 格式

### 部署到 GitHub Pages

```bash
# 1. 构建静态网站（将 my-lab 替换为你的仓库名）
npm run build:static:project my-lab

# 2. 提交到 GitHub
git add docs/
git commit -m "Deploy static site"
git push

# 3. 在 GitHub 仓库设置中配置：
# Settings -> Pages -> Source: Deploy from a branch
# Branch: main, Folder: /docs
```

**示例：**
```bash
# 如果你的仓库地址是：https://github.com/zq5437/labPageTest
# 那么构建命令应该是：
npm run build:static:project labPageTest
```

**详细说明：**
- 📦 [静态导出指南](./STATIC_EXPORT.md) - 导出功能详解
- 🌐 [GitHub Pages 部署](./GITHUB_PAGES.md) - 完整部署流程

## 🛠️ 故障排除

### 常见问题
1. **端口占用**: 确保5173、5174、5080端口未被占用
2. **数据库连接失败**: 检查MySQL服务状态和配置信息
3. **依赖安装失败**: 尝试清除node_modules后重新安装
4. **权限问题**: 确保有文件读写权限

### 日志查看
- 后端日志: 控制台输出
- 前端日志: 浏览器开发者工具
- 数据库日志: MySQL错误日志

## 🤝 贡献指南
欢迎提交Issue和Pull Request来改进项目！

## 📄 许可证
MIT License

## 📞 技术支持
如有问题，请查看项目文档或提交Issue。
